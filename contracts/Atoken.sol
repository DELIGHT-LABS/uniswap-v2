pragma solidity >=0.5.0;
import './UniswapV2ERC20.sol';

contract AC is UniswapV2ERC20 {
    constructor() public{
      name = 'A coin';
      symbol = 'AC';
      _mint(msg.sender, uint(1_000_000_000_000_000_000_000));
    }
}
