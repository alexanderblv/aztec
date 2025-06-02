contract PrivateAuction {
    use dep::aztec::{
        prelude::{AztecAddress, FunctionSelector, NoteHeader, NoteInterface, PrivateContext, Map},
        protocol_types::{
            abis::function_selector::FunctionSelector, 
            address::AztecAddress,
            constants::GENERATOR_INDEX__NOTE_NULLIFIER,
        },
        note::{
            lifecycle::{create_note, destroy_note},
            note_getter_options::NoteGetterOptions,
            note_header::NoteHeader,
            note_interface::NoteInterface,
            utils::compute_note_hash_for_consumption,
        },
        oracle::{
            nullifier_key::get_app_nullifier_secret_key,
            rand::rand,
        },
        state_vars::{
            Map, 
            PrivateSet,
        },
        types::type_serialization::{
            field_serialization::{FieldSerializationMethods, FIELD_SERIALIZED_LEN},
            bool_serialization::{BoolSerializationMethods, BOOL_SERIALIZED_LEN},
        },
    };

    // Структура для хранения информации об аукционе
    struct AuctionInfo {
        item_name: Field,
        description: Field,
        start_time: Field,
        end_time: Field,
        min_bid: Field,
        creator: AztecAddress,
        is_active: bool,
    }

    // Нота для приватной ставки
    struct BidNote {
        amount: Field,
        bidder: AztecAddress,
        auction_id: Field,
        random: Field,
        header: NoteHeader,
    }

    // Реализация интерфейса ноты для BidNote
    impl NoteInterface<BID_NOTE_LEN> for BidNote {
        fn compute_note_content_hash(self) -> Field {
            pedersen_hash([
                self.amount,
                self.bidder.to_field(),
                self.auction_id,
                self.random,
            ], 0)
        }

        fn compute_nullifier(self, context: &mut PrivateContext) -> Field {
            let note_hash_for_nullify = compute_note_hash_for_consumption(self);
            let secret = context.request_app_nullifier_secret_key(self.bidder);
            pedersen_hash([
                note_hash_for_nullify,
                secret.low,
                secret.high,
            ], GENERATOR_INDEX__NOTE_NULLIFIER)
        }

        fn compute_nullifier_without_context(self) -> Field {
            let note_hash_for_nullify = compute_note_hash_for_consumption(self);
            let secret = get_app_nullifier_secret_key(self.bidder);
            pedersen_hash([
                note_hash_for_nullify,
                secret.low,
                secret.high,
            ], GENERATOR_INDEX__NOTE_NULLIFIER)
        }

        fn serialize_content(self) -> [Field; BID_NOTE_LEN] {
            [self.amount, self.bidder.to_field(), self.auction_id, self.random]
        }

        fn deserialize_content(serialized_note: [Field; BID_NOTE_LEN]) -> Self {
            BidNote {
                amount: serialized_note[0],
                bidder: AztecAddress::from_field(serialized_note[1]),
                auction_id: serialized_note[2],
                random: serialized_note[3],
                header: NoteHeader::empty(),
            }
        }

        fn compute_note_hiding_point(self) -> Point {
            aztec::generators::Ga1
        }

        fn set_header(&mut self, header: NoteHeader) {
            self.header = header;
        }

        fn get_header(note: BidNote) -> NoteHeader {
            note.header
        }
    }

    global BID_NOTE_LEN: u32 = 4;

    struct Storage {
        // Публичная информация об аукционах
        auctions: Map<Field, AuctionInfo>,
        auction_counter: Field,
        
        // Приватные ставки
        bids: Map<Field, PrivateSet<BidNote>>,
        
        // Результаты аукционов (только победители)
        winners: Map<Field, AztecAddress>,
        winning_bids: Map<Field, Field>,
    }

    #[aztec(private)]
    fn constructor() {}

    // Создание нового аукциона (публичная функция)
    #[aztec(public)]
    fn create_auction(
        item_name: Field,
        description: Field,
        duration_hours: Field,
        min_bid: Field
    ) -> Field {
        let auction_id = storage.auction_counter.read();
        let start_time = context.timestamp();
        let end_time = start_time + duration_hours * 3600; // конвертация в секунды

        let auction_info = AuctionInfo {
            item_name,
            description,
            start_time,
            end_time,
            min_bid,
            creator: context.msg_sender(),
            is_active: true,
        };

        storage.auctions.at(auction_id).write(auction_info);
        storage.auction_counter.write(auction_id + 1);

        auction_id
    }

    // Размещение приватной ставки
    #[aztec(private)]
    fn place_bid(auction_id: Field, amount: Field) {
        // Получаем информацию об аукционе для проверки
        let auction_info = storage.auctions.at(auction_id).read();
        
        // Проверяем, что аукцион активен
        assert(auction_info.is_active, "Аукцион не активен");
        assert(context.timestamp() < auction_info.end_time, "Аукцион завершен");
        assert(amount >= auction_info.min_bid, "Ставка меньше минимальной");

        // Создаем приватную ноту ставки
        let random = rand();
        let bid = BidNote {
            amount,
            bidder: context.msg_sender(),
            auction_id,
            random,
            header: NoteHeader::empty(),
        };

        storage.bids.at(auction_id).insert(&mut bid, true);
    }

    // Завершение аукциона и определение победителя
    #[aztec(private)]
    fn finalize_auction(auction_id: Field) {
        let auction_info = storage.auctions.at(auction_id).read();
        
        // Проверяем, что аукцион завершен по времени
        assert(context.timestamp() >= auction_info.end_time, "Аукцион еще не завершен");
        assert(auction_info.is_active, "Аукцион уже завершен");

        // Получаем все ставки для этого аукциона
        let options = NoteGetterOptions::new();
        let bids = storage.bids.at(auction_id).get_notes(options);

        let mut highest_bid = 0;
        let mut winner = AztecAddress::zero();

        // Находим самую высокую ставку
        for bid in bids {
            if bid.amount > highest_bid {
                highest_bid = bid.amount;
                winner = bid.bidder;
            }
        }

        // Записываем результаты
        if highest_bid > 0 {
            storage.winners.at(auction_id).write(winner);
            storage.winning_bids.at(auction_id).write(highest_bid);
        }

        // Деактивируем аукцион
        let mut updated_auction = auction_info;
        updated_auction.is_active = false;
        storage.auctions.at(auction_id).write(updated_auction);
    }

    // Получение информации об аукционе (публичная функция)
    #[aztec(public)]
    fn get_auction_info(auction_id: Field) -> AuctionInfo {
        storage.auctions.at(auction_id).read()
    }

    // Получение победителя аукциона (публичная функция)
    #[aztec(public)]
    fn get_winner(auction_id: Field) -> (AztecAddress, Field) {
        let winner = storage.winners.at(auction_id).read();
        let winning_bid = storage.winning_bids.at(auction_id).read();
        (winner, winning_bid)
    }

    // Получение общего количества аукционов
    #[aztec(public)]
    fn get_auction_count() -> Field {
        storage.auction_counter.read()
    }

    // Проверка, является ли пользователь победителем (приватная функция)
    #[aztec(private)]
    fn am_i_winner(auction_id: Field) -> bool {
        let winner = storage.winners.at(auction_id).read();
        winner == context.msg_sender()
    }
} 