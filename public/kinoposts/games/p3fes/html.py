with open('tmp.txt') as f:
    lines = f.readlines()
    newlines = []
    for line in lines:
        newlines.append('''<img loading="lazy" class="rounding image" src="{0}"><br/>\n'''.format(line.replace('\n','')))
    with open('new.txt', "w") as w:
        w.writelines(newlines)