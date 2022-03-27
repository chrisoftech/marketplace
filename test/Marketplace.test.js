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

        it('lists product', async () => {
            // act (pass index to `marketplace.products(index)` to get product)
            const product = await marketplace.products(productCount);

            // assert success cases
            assert.equal(productCount, 1);

            // assert
            assert.equal(product.id.toNumber(), productCount.toNumber(), 'id is correct');
            assert.equal(product.name, productName, 'product name is correct');
            assert.equal(product.price, '1000000000000000000', 'product price is correct');
            assert.equal(product.owner, seller, 'product owner is correct');
            assert.equal(product.purchased, false, 'purchased is correct');
        });

        it('purchase product', async () => {
            // tract sellers balance before purchase
            let oldSellerBalance;
            oldSellerBalance = await web3.eth.getBalance(seller);

            // format balance to big-number (BN)
            oldSellerBalance = new web3.utils.BN(oldSellerBalance);

            // act 
            result = await marketplace.purchaseProduct(productCount, { 'from': buyer, value: productPrice });

            // assert product is purchased with accurate parameters
            const event = result.logs[0].args;
            assert.equal(event.id.toNumber(), productCount.toNumber(), 'id is correct');
            assert.equal(event.name, productName, 'product name is correct');
            assert.equal(event.price, '1000000000000000000', 'product price is correct');
            assert.equal(event.owner, buyer, 'product owner is correct');
            assert.equal(event.purchased, true, 'purchased is correct');

            // assert seller received payments (after transaction)
            let newSellerBalance;
            newSellerBalance = await web3.eth.getBalance(seller);
            newSellerBalance = new web3.utils.BN(newSellerBalance);

            let price;
            price = productPrice;
            price = new web3.utils.BN(price);

            const expectedBalance = oldSellerBalance.add(price);

            // assert seller received funds
            assert.equal(newSellerBalance.toString(), expectedBalance.toString());

            // assert failure cases
            // tries to buy a product that does not exists (product must have valid id)
            await marketplace.purchaseProduct(99, { 'from': buyer, value: productPrice }).should.be.rejected;

            // buyer tries to buy with not enough Ether
            await marketplace.purchaseProduct(productCount, { 'from': buyer, value: web3.utils.toWei('0.5', 'Ether') }).should.be.rejected;

            // deployer tries to buy the product i.e. product cant be purchased twice
            await marketplace.purchaseProduct(productCount, { 'from': deployer, value: web3.utils.toWei(productPrice, 'Ether') }).should.be.rejected;

            // buyer tries to buy the product again i.e. buyer can't be the seller
            await marketplace.purchaseProduct(productCount, { 'from': buyer, value: web3.utils.toWei(productPrice, 'Ether') }).should.be.rejected;
        });
    })
});