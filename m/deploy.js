(function(global){

  "use strict";

  let YEAR= ""+ new Date().getFullYear();
  let path = require('path');
  let fs = require('fs');
  let TPL="tpl.html";
  let MNF="../manifest.json";
  let CHUNK=10;
  let KL= "../assets/images/kl/";
  let g_meta;

  ////////////////////////////////////////////////////////////////////////////
  //
  ////////////////////////////////////////////////////////////////////////////
  function listFiles(subdir,ext){
    let dir= path.join(__dirname, subdir);
    let rc=fs.readdirSync(dir);
    if(ext){
      ext="."+ext.toLowerCase();
      rc=rc.filter(n=> n.endsWith(ext));
    }
    return rc;
  }

  ////////////////////////////////////////////////////////////////////////////
  //
  ////////////////////////////////////////////////////////////////////////////
  function readFile(f){
    return fs.readFileSync(path.join(__dirname,f), "utf-8");
  }

  let INTRO=`
<div id="intro">
  <h1>The journey<br />
  begins...</h1>
  <ul class="actions">
    <li><a href="#header" class="button icon solid solo fa-arrow-down scrolly">Continue</a></li>
  </ul>
</div>
  `;

  let POST=`
<article>
  <header>
    <span class="date">{{{POST-DATE}}}</span>
    <h2>{{{POST-DESC}}}</h2>
  </header>
  <a href="javascript:void(0)" class="image fit"><img src="/assets/images/kl/{{{POST-IMG}}}" alt="" /></a>
  <h6>{{{POST-NUM}}}</h6>
  <div>
  <span class="fa fa-star checked"></span>
  <span class="fa fa-star checked"></span>
  <span class="fa fa-star checked"></span>
  <span class="fa fa-star"></span>
  <span class="fa fa-star"></span>
  </div>
</article>
    `;

  let PAGES=`
<a href="{{{PURL}}}" class="next">Prev</a>
<a href="{{{NURL}}}" class="next">Next</a>
  `;

  ////////////////////////////////////////////////////////////////////////////
  //
  ////////////////////////////////////////////////////////////////////////////
  function delFile(f){
    return delOneFile(path.join(__dirname, f))
  }

  ////////////////////////////////////////////////////////////////////////////
  //
  ////////////////////////////////////////////////////////////////////////////
  function delOneFile(f){
    try{
      console.log(`deleting file ${f}`);
      fs.unlinkSync(f)
    }
    catch(e){
    }
  }

  ////////////////////////////////////////////////////////////////////////////
  //
  ////////////////////////////////////////////////////////////////////////////
  function modGI(meta,file,info){
    let s=POST;
    s= s.replace("{{{POST-DATE}}}", fmtDate(meta.when));
    s= s.replace("{{{POST-DESC}}}", meta.title);
    s= s.replace("{{{POST-IMG}}}", file);
    s=s.replace("{{{POST-NUM}}}", `${info.cur}/${info.total}`);
    return s;
  }

  ////////////////////////////////////////////////////////////////////////////
  //
  ////////////////////////////////////////////////////////////////////////////
  function modPage(index, pages, gi,out){
    let ps,n,p;
    if(index==1){
      n="/m/gallery"+(index+1)+".html";
      p="/m/gallery"+pages+".html";
      ps=PAGES.replace("{{{PURL}}}",p).replace("{{{NURL}}}",n);
    }
    else if(index<pages){
      n="/m/gallery"+(index+1)+".html";
      p="/m/gallery"+(index-1)+".html";
      ps=PAGES.replace("{{{PURL}}}",p).replace("{{{NURL}}}",n);
    }else{
      n="/m/gallery"+1+".html";
      p="/m/gallery"+(index-1)+".html";
      ps=PAGES.replace("{{{PURL}}}",p).replace("{{{NURL}}}",n);
    }
    out=out.replace("{{{PAGES}}}",ps);
    out=out.replace("{{{POSTS}}}",gi);
    out=out.replace("{{{YEAR}}}", YEAR);
    return out;
  }

  ////////////////////////////////////////////////////////////////////////////
  //
  ////////////////////////////////////////////////////////////////////////////
  function doMain(index,pages, root,nums, info){
    let gi="",
        px=root,
        out=root;

    for(let s,m,obj,i=0; i<CHUNK;++i){
      if(nums.length>0){
        obj=nums.pop();
        m=g_meta[obj.f];
        ++info.cur;
        gi += modGI(m,obj.f,info) + "\n";
      }
    }

    out=out.replace("{{{FADEIN}}}","");
    out=out.replace("{{{INTRO}}}","");
    if(index==1){
      px=px.replace("{{{FADEIN}}}",'class="fade-in"');
      px=px.replace("{{{INTRO}}}",INTRO);
    }

    out=modPage(index,pages,gi,out);
    px=modPage(index,pages,gi,px);

    //write file
    let p=path.join(__dirname,"gallery"+ String(index)+".html");
    delOneFile(p);
    fs.writeFileSync(p,out,"utf-8");
    //
    if(index==1){
      delFile("index.html");
      fs.writeFileSync( path.join(__dirname,"index.html"),px,"utf-8");
    }
  }

  ////////////////////////////////////////////////////////////////////////////
  //
  ////////////////////////////////////////////////////////////////////////////
  const Months={1:"Jan",2:"Feb",3:"Mar",4:"Apr",5:"May",6:"Jun",7:"Jul",8:"Aug",9:"Sep",10:"Oct",11:"Nov",12:"Dec"};
  function fmtDate(s){
    let e= `Bad Date ${s}`;
    if(s.length != 8) {throw e}
    let year=parseInt(s.substring(0,4));
    let mon=parseInt(s.substring(4,6));
    let day=parseInt(s.substring(6,8));
    if(!(day>0&&day<32) && (mon>0&&mon<13) && (year>1965)) {throw e}
    return `${Months[mon]} ${day}, ${year}`;
  }

  ////////////////////////////////////////////////////////////////////////////
  //--------------- code starts --------
  ////////////////////////////////////////////////////////////////////////////
  let nums= listFiles(KL,"jpg").map(x=>{
    let p=x.substring(0,x.lastIndexOf("."));
    let z=/[0-9]+/.test(p);
    return z? {n:parseInt(p),f:x}: null;
  });

  if(nums.some(x=> x===null)){
    return console.log("some file names are not numbered.");
  }

  let totalImages=0;
  g_meta= JSON.parse(readFile(MNF));
  totalImages=Object.keys(g_meta).length;
  console.log(`total count of images=${totalImages}`);
  //console.log(JSON.stringify(meta));

  nums.sort(function(a,b){return a.n<b.n?-11:a.n>b.n?1:0});
  //nums.forEach(c=>console.log(c));
  console.log("number of files= " + nums.length);

  let pages= Math.floor(nums.length/CHUNK);
  if((nums.length%CHUNK)>0) pages+=1;
  console.log(`pages=${pages}, per page=${CHUNK}`);

  let info= {id:"kl",artist:"Josen",cur:0, total:totalImages};
  let root= readFile(TPL).replaceAll("\r\n","\n");
  //console.log(root);

  for(let i=1;i<=pages;++i){
    doMain(i,pages,root,nums, info);
  }

})(this);



