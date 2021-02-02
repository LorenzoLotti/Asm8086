/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */

var ax = 0,
    bx = 0, 
    cx = 0,
    dx = 0,
    sp = 0xFFFE,
    bp = 0,
    si = 0,
    di = 0,
    ip = 0x100;

/* exported mov */
function mov(reg, val)
{
  if (!isReg(reg))
    return 1;
  eval(reg + ' = ' + val);
  ip += 3;
  return 0;
}

/* exported ret */
function ret()
{
  ip = 0;
  return -1;
}
