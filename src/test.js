describe('Token', function () {
  let near;
  let contract;
  let accountId;

  beforeAll(async function () {
    console.log('nearConfig', nearConfig);
    near = await nearlib.connect(nearConfig);
    accountId = nearConfig.contractName;
    contract = await near.loadContract(nearConfig.contractName, {
      viewMethods: ['get_message'],
      changeMethods: ['store_message'],
      sender: accountId
    });
  });

  describe('message', function () {
    it('can be stored and retrieve', async function () {
      key = 'testKey';
      value = 'test message';
      await contract.store_message( { key, value }  , );
      let retrievedMessage = '';
      contract.get_message({ key}).then(message => {  
        retrievedMessage = message;
        expect(retrievedMessage).toEqual(value);
      });
    });
   
  });
});