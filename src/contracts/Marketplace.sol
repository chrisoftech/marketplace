pragma solidity >=0.5.0;

contract Marketplace {
    string public name;
    uint256 public productCount = 0;
    mapping(uint256 => Product) public products;

    struct Product {
        uint256 id;
        string name;
        uint256 price;
        address payable owner;
        bool purchased;
    }

    event ProductCreated(
        uint256 id,
        string name,
        uint256 price,
        address payable owner,
        bool purchased
    );

    event ProductPurchased(
        uint256 id,
        string name,
        uint256 price,
        address payable owner,
        bool purchased
    );

    constructor() public {
        name = "Dapp University Marketplace";
    }

    function createProduct(string memory _name, uint256 _price) public {
        // require valid name
        require(bytes(_name).length > 0);

        // require valid price
        require(_price > 0);

        // increment product-count
        productCount++;

        // create product (use productCount as product-id)
        products[productCount] = Product(
            productCount,
            _name,
            _price,
            msg.sender,
            false
        );

        // trigger log event
        emit ProductCreated(productCount, _name, _price, msg.sender, false);
    }

    // annotate all definitions of seller-addres with `payable`
    // tag to allow value payments to that address
    function purchaseProduct(uint256 _id) public payable {
        // fetch product (copy to memory)
        Product memory _product = products[_id];

        // fetch owner
        address payable _seller = _product.owner;

        // validate product
        // require product to have a valid id
        require(_product.id > 0 && _product.id <= productCount);

        // require payment price to be equal to product price
        require(msg.value >= _product.price);

        // require that product has not been purchased already
        require(!_product.purchased);

        // require that seller is not the buyer
        require(_seller != msg.sender);

        // purchase product (transfer ownership to buyer)
        _product.owner = msg.sender;

        // mark as purchased
        _product.purchased = true;

        // update product with new details
        products[_id] = _product;

        // pay seller by sending them Ether
        address(_seller).transfer(msg.value);

        // trigger log event
        emit ProductPurchased(
            _id,
            _product.name,
            _product.price,
            msg.sender,
            true
        );
    }
}
