pragma solidity >=0.5.0;
import './UniswapV2ERC20.sol';

contract BC is UniswapV2ERC20 {
    constructor() public{
      name = 'B coin';
      symbol = 'BC';
      _mint(msg.sender, uint(1_000_000_000_000_000_000_000));
    }
}
