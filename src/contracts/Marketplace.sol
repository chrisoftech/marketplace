pragma solidity >=0.5.0;

contract Marketplace {
    string public name;
    uint256 public productCount = 0;
    mapping(uint256 => Product) public products;

    struct Product {
        uint256 id;
        string name;
        uint256 price;
        address owner;
        bool purchased;
    }

    event ProductCreated(
        uint256 id,
        string name,
        uint256 price,
        address owner,
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
}
