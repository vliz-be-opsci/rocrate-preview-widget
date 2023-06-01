# python script to turn parentID into hierarchicall finesse
# Made by Decruw Cedric and marc test

# import 

import csv
import pandas as pd
# dependencies

path_file = "C:\\Users\\cedric\\Desktop\\new_excel_file_parentID.txt"

# functions

def loopover(parent,hierarchy,parentdiclist):
    for dic in parentdiclist:
        if dic['spcolid'] == parent:
            if dic['parent_spcolid'] != 'NULL':
                #continue hierarchy
                hierarchy.append(dic['parent_spcolid'])
                loopover(dic['parent_spcolid'],hierarchy,parentchilddic)


#script
parentchilddic = []
spcols = []
parentspcol = []
with open(path_file, newline='',) as csvfile:
    spamreader = csv.reader(csvfile, delimiter='\t', quotechar='|')
    x = 0
    for row in spamreader:
        spcols.append(row[0])
        parentspcol.append(row[3])
        parentchilddic.append({'spcolid':row[0],'parent_spcolid':row[3]})
        x+=1
        #print(', '.join(row))


listhierarchies = {}
x=0
for dic in parentchilddic:
    hierarchy = []
    if dic['parent_spcolid'] != 'NULL':
        # start hierarchy
        hierarchy = [dic['spcolid'],dic['parent_spcolid']]
        #check if parent has parent
        loopover(dic['parent_spcolid'],hierarchy,parentchilddic)
        listhierarchies[x] = hierarchy
    else:
        hierarchy = [dic['spcolid']]
        listhierarchies[x] = hierarchy
    x+=1

for key, value in listhierarchies.items():
    print(value)

        
with open("C:\\Users\\cedric\\Desktop\\"+"new_parent_child_id.txt", 'w', newline='') as csvfilew:
    spamwriter = csv.writer(csvfilew, delimiter='\t',
                            quotechar='"')
    with open(path_file, newline='',) as csvfile:
        spamreader = csv.reader(csvfile, delimiter='\t', quotechar='|')
        
        x = 0
        for row in spamreader:
            if x == 0:
                headers = row   
                headers.append('hierarchy_spcolIDs')
                spamwriter.writerow(headers)
                x+=1
            else:
                toappend = row
                toappend.append(listhierarchies[x])
                spamwriter.writerow(toappend)
                x+=1


        


