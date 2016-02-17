var canvas,ctx,pen,sei,yo,ghei,gwid,utank,kt,kk;

window.onload=function(){
    var a,b,c,d,e,f;
    canvas = document.getElementsByTagName('canvas')[0];
    ctx = canvas.getContext('2d');
    canvas.width=canvas.height=400;
    ctx.fillRect(0,0,400,400);
    kk=Math.PI*2/6;
    kt=[];
    for(a=0;a<6;a++)kt[a]=kk*a;
    utank=[];
    pen=25;
    sei=pen*Math.sin(Math.PI/6);
    yo=pen*Math.cos(Math.PI/6);
    ghei=Math.floor(canvas.height/yo)-1;
    gwid=Math.floor(canvas.width/(pen*3));
    
    for(a=0;a<ghei;a++){
        utank[a]=[];
        for(b=0;b<gwid;b++){
            c=[0,1,2,3,4,5];
            d=[];
            for(e=0;e<6;e++){
                f=(Math.random()*c.length)|0;
                d[e]=c[f];
                c[f]=c[c.length-1];
                c.pop();
            }
            utank[a][b]=[[d[0],d[1]],[d[2],d[3]],[d[4],d[5]]];
        }
    }
    mei();
};

function mei(){
    var a,b,c,d,r,tim;
    tim=new Date().getTime()/8000;
    a=tim%1;
    b=a*6;
    c=b|0;
    d=b-c;
    d*=4;
    if(d>1)d=1;
    b=c+d;
    r=b/6*Math.PI*2;
    ctx.fillStyle="rgb(0,0,0)";
    ctx.fillRect(0,0,canvas.width,canvas.height);
    for(a=0;a<ghei;a++){
        for(b=0;b<gwid;b++){
            hex(b,a,r,utank[a][b]);
        }
    }
    requestAnimationFrame(mei);
}

function hex(x,y,r,sk){
    var a,b,c,d,e,px,py,p1,p2,rad;
    ctx.fillStyle="hsl("+((x*113+y*1113)%360)+",10%,60%)";
    a=y%2;if(a<0)a+=2;
    x=(x+a/2+0.5)*pen*3;
    y=(y+1.2)*yo;
    
    ctx.lineWidth=1;
    ctx.strokeStyle="rgb(0,0,0)";
    ctx.beginPath();
    for(a=0;a<6;a++){
        px=Math.cos(kt[a]+r)*pen+x;
        py=Math.sin(kt[a]+r)*pen+y;
        ctx.lineTo(px,py);
    }
    ctx.closePath();
    ctx.stroke();
    ctx.fill();
    
    for(a=0;a<sk.length;a++){
        p1=sk[a][0];p2=sk[a][1];
        c=Math.abs(p1-p2);
        ctx.beginPath();
        if(c==1 || c==5){
            d=p1;
            if(p2>p1)d=p2;
            if(d==5 && c==5)d=0;
            px=Math.cos(kt[d]+r)*pen+x;
            py=Math.sin(kt[d]+r)*pen+y;
            ctx.arc(px, py, sei, kt[d]+kk*2+r, kt[d]-kk*2+r, false);
        }else if(c==2 || c==4){
            d=(p1+p2)/2;
            if(c==4)d=((p1+p2)/2+3)%6;
            px=Math.cos(kt[d]+kk/2+r)*yo*2;
            py=Math.sin(kt[d]+kk/2+r)*yo*2;
            ctx.arc(px+x, py+y, sei*3,kt[d]+Math.PI+r,kt[d]+Math.PI+kk+r, false);
        }else if(c==3){
            rad=(kt[p1]+kk/2+r);
            px=Math.cos(rad)*yo;
            py=Math.sin(rad)*yo;
            ctx.moveTo(x-px,y-py);
            ctx.lineTo(x+px,y+py);
        }
        for(b=0;b<4;b++){
            ctx.lineWidth=pen*0.5-b*4;
            ctx.strokeStyle="hsl(244,50%,"+(50*(b+1)/4+30)+"%)";
            ctx.stroke();
        }
    }
}