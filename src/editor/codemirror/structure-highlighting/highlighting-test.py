from microbit import *

a = 1 + 2 + 3 + 4 - 5 * 2
b = 1 \
    + 2 + \
    3 + 4\
    - 5 *\
    2
verses = '''
My mistress' eyes are nothing like the sun;
Coral is far more red than her lips' red;
If snow be white, why then her breasts are dun;
If hairs be wires, black wires grow on her head.
'''
d = [[0, 0],
     [0, 0]]

def gcd (a, b):
    return (gcd(b, a % b) if b > 0 else a)

def fastPower (val, cnt):
    ans = 1
    while cnt > 0:
        if cnt & 1:
            ans *= val
        cnt >>= 1
        val *= val
    return ans

N = 10000000
checked = [0] * N
primes = []
def linearPrime():
    for v in range (2, N):
        if checked[v] == False:
            primes.append(v)
        for u in primes:
            if u * v >= N:
                break;
            checked[u * v] = True
            if v % u == 0:
                break;
