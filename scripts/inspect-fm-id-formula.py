pairs = [
    (365669280828825158, 85139014, "Mbappe"),
    (32034013584674500, 7458500, "Messi"),
    (77328554015242729, 18004457, "De Bruyne"),
    (8591035097765477607, 2000210909, "Yamal"),
    (125323885846281577, 29179241, "Haaland"),
]

for db_id, face_id, name in pairs:
    print(name)
    print(" db", db_id, hex(db_id))
    print(" fm", face_id, hex(face_id))
    print(" hi32", db_id >> 32, "lo32", db_id & 0xFFFFFFFF)
    print(" div", db_id // face_id, "mod", db_id % face_id)
    print()
