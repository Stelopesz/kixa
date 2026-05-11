content = open('/Users/stelopes/kixa/app/page.tsx').read()
# fix tiltOff line
content = content.replace(
    'const tiltOff=(e)=>{e.currentTarget.style.transform="";e.currentTarget.style.boxShadow="";e.currentTarget.style.borderColor=bor;};',
    'const tiltOff=(e:React.MouseEvent<HTMLDivElement>)=>{e.currentTarget.style.transform="";e.currentTarget.style.boxShadow="";e.currentTarget.style.borderColor=bor;};'
)
open('/Users/stelopes/kixa/app/page.tsx', 'w').write(content)
print('fixed')
