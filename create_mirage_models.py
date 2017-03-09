import glob
import os

directory = glob.glob("app/models/*")

for f in directory:
    print(os.path.basename(f).split('.')[0])
    os.system('ember g mirage-model ' + os.path.basename(f).split('.')[0])

