
use near_sdk::borsh::{self, BorshDeserialize, BorshSerialize};
use near_sdk::{env, near_bindgen};
use near_sdk::collections::{ LookupMap };

near_sdk::setup_alloc!();

// add the following attributes to prepare your code for serialization and invocation on the blockchain
// More built-in Rust attributes here: https://doc.rust-lang.org/reference/attributes.html#built-in-attributes-index
#[near_bindgen]
#[derive( BorshDeserialize, BorshSerialize)]
pub struct Messages {
    message_map:  LookupMap<String, String>
}

impl Default for Messages {
    fn default() -> Self {
        Messages {
            // tree_map: TreeMap::new(b"t".to_vec()),
           //  unordered_map: UnorderedMap::new(b"u".to_vec()),
           message_map: LookupMap::new(b"l".to_vec()),
             // last_line_added: 0
         }
    }
}

#[near_bindgen]
impl Messages {

    pub fn store_message(&mut self, key: String, value: String) {
        let new_key = self.check_cheating(key);
        self.message_map.insert(&new_key, &value);
        let log_message = format!("Message added!");
        env::log(log_message.as_bytes());
    }

    pub fn get_message(&self, key: String) -> String {
        match self.message_map.get(&key) {
            Some(value) => {
                let log_message = format!("Your message is {:?}", value.clone());
                env::log(log_message.as_bytes());
                value
            },
            None => "Message not found".to_string()
        }
    }

    fn check_cheating(&self, key: String ) -> String {
        // check if the account already promised his love 
        let contain = self.message_map.contains_key(&key);
        assert_eq!(false,contain, "You can only love once");
        env::log("Make sure you don't overflow, my friend.".as_bytes());
        key
    } 
}


// unit tests
#[cfg(test)]
mod tests {
    use super::*;
    use near_sdk::MockedBlockchain;
    use near_sdk::testing_env;
    use near_sdk::test_utils::VMContextBuilder;
    use near_sdk::json_types::ValidAccountId;
    use near_sdk::serde::export::TryFrom;

    // simple helper function to take a string literal and return a ValidAccountId
    fn to_valid_account(account: &str) -> ValidAccountId {
        ValidAccountId::try_from(account.to_string()).expect("Invalid account")
    }

    // part of writing unit tests is setting up a mock context
    // provide a `predecessor` here, it'll modify the default context
    fn get_context(predecessor: ValidAccountId) -> VMContextBuilder {
        let mut builder = VMContextBuilder::new();
        builder.predecessor_account_id(predecessor);
        builder
    }

    // mark individual unit tests with #[test] for them to be registered and fired
   #[test]
    fn store_and_get_message() {
        // set up the mock context into the testing environment
        let context = get_context(to_valid_account("foo.near"));
        testing_env!(context.build());
        // instantiate a contract variable with the message in blank
        let mut contract = Messages { message_map: LookupMap::new(b"l".to_vec()) };
 
        // Stored the test message
        contract.store_message(String::from("foo.near"), String::from("love message"));

        // confirm that we received the test message when calling get_message
        println!("This is the message that we store:  {}", contract.get_message(String::from("foo.near")));
        assert_eq!(String::from("love message"), contract.get_message(String::from("foo.near")));
    }

    #[test]
    fn get_message() {
        let context = VMContextBuilder::new();
        testing_env!(context.build());
        let m =  "love Message";
        let mut contract = Messages {  message_map: LookupMap::new(b"l".to_vec()) };
        contract.message_map.insert(&String::from("foo.near"), &String::from("love Message"));
        println!("Value retrieved: {}", contract.get_message(String::from("foo.near")));
        assert_eq!(m, contract.get_message(String::from("foo.near")));
    }

    #[test]
    #[should_panic]
    fn check_cheating() {
        let context = get_context(to_valid_account("foo.near"));
        testing_env!(context.build());
        // instantiate a contract variable with the message in blank
        let mut contract = Messages { message_map: LookupMap::new(b"l".to_vec()) };
 
        // Stored the test message the first time
        contract.store_message(String::from("foo.near"), String::from("first love"));
        // Stored the test message the second time
        contract.store_message(String::from("foo.near"), String::from("new love"));
    }
}
