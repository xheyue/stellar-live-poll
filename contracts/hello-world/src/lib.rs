#![no_std]

use soroban_sdk::{
    contract, contractimpl, contracttype, Address, Env,
};

#[contracttype]
#[derive(Clone)]
pub enum DataKey {
    Votes(u32),
    HasVoted(Address),
}

#[contract]
pub struct PollContract;

#[contractimpl]
impl PollContract {
    // Bir kullanıcının oy vermesi
    pub fn vote(env: Env, voter: Address, option: u32) {
        // Sadece 0, 1 veya 2 seçeneklerine izin ver
        if option > 2 {
            panic!("Invalid poll option");
        }

        // Cüzdan sahibinin işlemi onaylamasını iste
        voter.require_auth();

        // Kullanıcı daha önce oy vermiş mi?
        let voter_key = DataKey::HasVoted(voter.clone());

        let already_voted: bool = env
            .storage()
            .persistent()
            .get(&voter_key)
            .unwrap_or(false);

        if already_voted {
            panic!("This wallet has already voted");
        }

        // Mevcut oy sayısını al
        let vote_key = DataKey::Votes(option);

        let current_votes: u32 = env
            .storage()
            .persistent()
            .get(&vote_key)
            .unwrap_or(0);

        // Oy sayısını artır
        env.storage()
            .persistent()
            .set(&vote_key, &(current_votes + 1));

        // Kullanıcının oy verdiğini kaydet
        env.storage()
            .persistent()
            .set(&voter_key, &true);
    }

    // Belirli bir seçeneğin oy sayısını getir
    pub fn get_votes(env: Env, option: u32) -> u32 {
        if option > 2 {
            panic!("Invalid poll option");
        }

        env.storage()
            .persistent()
            .get(&DataKey::Votes(option))
            .unwrap_or(0)
    }

    // Bir cüzdan daha önce oy vermiş mi?
    pub fn has_voted(env: Env, voter: Address) -> bool {
        env.storage()
            .persistent()
            .get(&DataKey::HasVoted(voter))
            .unwrap_or(false)
    }
}