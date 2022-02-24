const Marketplace = artifacts.require('./Marketplace.sol');

require('chai').use(require('chai-as-promised')).should();

contract('Marketplace', ([deployer, seller, buyer]) => {
    let marketplace;

    before(async () => {
        marketplace = await Marketplace.deployed();
    });

    describe('deployment', () => {
        it('deploys successfully', async () => {
            // act
            const address = await marketplace.address;

            // assert
            assert.notEqual(address, 0x0);
            assert.notEqual(address, '');
            assert.notEqual(address, null);
            assert.notEqual(address, undefined);
        });

        it('has a name object', async () => {
            // act
            const name = await marketplace.name();

            // assert
            assert.equal(name, 'Dapp University Marketplace');
        })
    })

    describe('deployment', () => {
        let result, productCount;
        let productName;
        let productPrice;

        before(async () => {
            productName = 'IPhone X';
            productPrice = web3.utils.toWei('1', 'Ether');

            // using `wei` as currency denomination `'1000000000000000000'`
            // convert `1` Ether to `Wei` using web3.utils.toWei('1', 'Ether')
            // pass `seller` in metadata `from` key to let solidity know whose triggers this request
            // in context, `msg.sender` refers to wallet address passed in the metadata `from` key
            result = await marketplace.createProduct(productName, productPrice, { 'from': seller });
            productCount = await marketplace.productCount();
        });

        it('creates products', async () => {
            // assert success cases
            assert.equal(productCount, 1);

            // assert product is created with accurate parameters
            const event = result.logs[0].args;
            assert.equal(event.id.toNumber(), productCount.toNumber(), 'id is correct');
            assert.equal(event.name, productName, 'product name is correct');
            assert.equal(event.price, '1000000000000000000', 'product price is correct');
            assert.equal(event.owner, seller, 'product owner is correct');
            assert.equal(event.purchased, false, 'purchased is correct');

            // assert failure
            // product must have a name
            await marketplace.createProduct('', productPrice, { 'from': seller }).should.be.rejected;

            // product must have a price
            await marketplace.createProduct(productName, 0, { 'from': seller }).should.be.rejected;
        });
    })
});