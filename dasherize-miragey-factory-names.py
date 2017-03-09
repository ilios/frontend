import glob
import os
import re

directory = glob.glob("mirage/factories/*")

for f in directory:
    ccn = os.path.basename(f)
    dn = re.sub('([A-Z]+)', r'-\1',os.path.basename(f)).lower()
    print(ccn, dn)
    os.system('mv mirage/factories/' + ccn + '  mirage/factories/' + dn)

