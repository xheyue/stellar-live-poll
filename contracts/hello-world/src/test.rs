#![cfg(test)]

use super::*;
use soroban_sdk::{Address, Env};
use soroban_sdk::testutils::Address as _;

#[test]
fn vote_increases_selected_option() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register(PollContract, ());
    let client = PollContractClient::new(&env, &contract_id);

    let voter = Address::generate(&env);

    assert_eq!(client.get_votes(&0), 0);

    client.vote(&voter, &0);

    assert_eq!(client.get_votes(&0), 1);
    assert!(client.has_voted(&voter));
}

#[test]
fn different_options_are_counted_separately() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register(PollContract, ());
    let client = PollContractClient::new(&env, &contract_id);

    let voter_one = Address::generate(&env);
    let voter_two = Address::generate(&env);

    client.vote(&voter_one, &0);
    client.vote(&voter_two, &1);

    assert_eq!(client.get_votes(&0), 1);
    assert_eq!(client.get_votes(&1), 1);
    assert_eq!(client.get_votes(&2), 0);
}

#[test]
#[should_panic]
fn same_wallet_cannot_vote_twice() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register(PollContract, ());
    let client = PollContractClient::new(&env, &contract_id);

    let voter = Address::generate(&env);

    client.vote(&voter, &0);
    client.vote(&voter, &1);
}

#[test]
#[should_panic]
fn invalid_option_is_rejected() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register(PollContract, ());
    let client = PollContractClient::new(&env, &contract_id);

    let voter = Address::generate(&env);

    client.vote(&voter, &3);
}