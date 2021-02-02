/* eslint-disable no-undef */

var paramsCountError = 'Invalid parameter count.',
    istructionError = 'Unknown istuction.',
    addressError = 'Invalid address.',
    regParamError = 'The first parameter must be a register.',
    regParamError2 = 'The second parameter must be a register.',
    paramError = 'The first parameter is invalid.',
    paramError2 = 'The second parameter is invalid.';

var code = document.getElementById('code');
var output = document.getElementById('output');

function errorAlert(line, message)
{
  window.alert('ERROR: line ' + line + '.\n' + message);
}

function isReg(id)
{
  switch (id)
  {
    case 'ax': case 'ah': case 'al':
    case 'bx': case 'bh': case 'bl':
    case 'cx': case 'ch': case 'cl':
    case 'dx': case 'dh': case 'dl':
    case 'sp': case 'bp': case 'si': case 'di': case 'ip':
      return true;
      
    default:
      return false;
  }
}

function checkOverflow(n)
{
  return isNaN(n) || n > 0xFFFF;
}

function run(flow)
{
  ax = 0;
  bx = 0; 
  cx = 0;
  dx = 0;
  sp = 0xFFFE;
  bp = 0;
  si = 0;
  di = 0;
  ip = 0x100;
  output.innerHTML = '';
  writeRegs();
  for (;;)
  {
    try
    {
      var func = eval(flow[ip]);
      var oldIP = ip;
      var params = '';
      var script = flow[ip] + "(";
      for (var i = 1; i <= func.length; i++)
      {
        var color = typeof flow[ip + i] == 'number' ? 'palegreen' : 'lightskyblue';
        var value = typeof flow[ip + i] == 'number' ? h(flow[ip + i]) : flow[ip + i].toUpperCase();
        params += '<span style="color:' + color + '">' + value + '</span>' + (i == func.length ? '' : ',');
        script += '\'' + flow[ip + i] + '\'' + (i == func.length ? '' : ',');
      }
      var result = eval(script + ')');
      if (result == 1)
      {
        write('Runtime error.', 'red');
        break;
      }

      write('Istruction: ', 'yellow');
      write(h(oldIP) + ' ', null);
      write(flow[oldIP].toUpperCase() + ' ', 'dodgerblue');
      write(params + '<br>', null);
      writeRegs();

      if (result == -1)
      {
        write('Program terminated', 'yellow');
        break;
      }
    }
    catch (e)
    {
      write('Runtime error.', 'red');
      break;
    }
  }
}

function write(text, color)
{
  if (color == null)
    output.innerHTML += text;
  else
    output.innerHTML += '<span style="color:' + color + '">' + text + '</span>';
}

function writeReg(reg)
{
  write(' ' + reg.toUpperCase(), 'lightskyblue');
  write('=', null);
  write(h(eval(reg)), 'palegreen');
}

function writeRegs()
{
  write('Registers:&nbsp;', 'yellow');
  writeReg('ax');
  writeReg('bx');
  writeReg('cx');
  writeReg('dx');
  writeReg('sp');
  writeReg('bp');
  writeReg('si');
  writeReg('di');
  writeReg('ip');
  write('<br><br>', null);
}

function h(n)
{
  return ('0000' + n.toString(16).toUpperCase()).slice(-4);
}

/* exported onRunClick */
function onRunClick()
{
  var lines = code.value.toLowerCase().replace(/\r/, /\n/).split(/\n/);
  var flow = {};
  
  for (var i = 0; i < lines.length; i++)
  {
    lines[i] = lines[i].trim();
    while(lines[i].includes('  '))
      lines[i] = lines[i].replace('  ', ' ');
    lines[i] = lines[i].replace(', ', ',');
    
    var rawFlow = lines[i].split(' ', 3);
    if (rawFlow.length > 1 && rawFlow[0].length < 5)
    {
      var label = parseInt(rawFlow[0], 16);
      if (checkOverflow(label))
      {
        errorAlert(i + 1, addressError);
        return;
      }
      else
      {
        flow[label] = rawFlow[1];
        var params = rawFlow.length < 3 ? [] : rawFlow[2].split(',', 2);
        switch (rawFlow[1])
        {
          case 'ret':
            break;
            
          case 'mov':
            if (params.length == 2)
            {
              var isParamReg = isReg(params[1]);
              var value = parseInt(params[1], 16);
              if (!isReg(params[0]))
              {
                errorAlert(i + 1, regParamError);
                return;
              }
              else if (!isParamReg && checkOverflow(value))
              {
                errorAlert(i + 1, paramError2);
                return;
              }
              if (checkOverflow(label + 2))
              {
                errorAlert(i + 1, '');
                return;
              }
              else
              {
                flow[label + 1] = params[0];
                flow[label + 2] = isParamReg ? params[1] : value;
              }
            }
            else
            {
              errorAlert(i + 1, paramsCountError);
              return;
            }
            break;

          default:
            errorAlert(i + 1, istructionError);
            return;
        }
      }
    }
    else if (!(rawFlow.length == 1 && rawFlow[0].length == 0))
    {
      errorAlert(i + 1, '');
      return;
    }
  }
  
  run(flow);
}

/* exported onCodeChanged */
function onCodeChanged()
{
  if (window.event.keyCode == 13)
  {
    var ss = code.selectionStart;
    code.value = code.value.substr(0, ss) + "\n0100" + code.value.substr(ss);
    code.selectionStart = code.selectionEnd = ss + 5;
    window.event.preventDefault();
  }
}
