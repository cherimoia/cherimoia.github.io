(function(global){

  "use strict";

  let path = require('path');
  let fs = require('fs');
  let TPL="tpl.html";
  let MNF="manifest.json";
  let CHUNK=16;
  let KL= "assets/images/kl/";
  let g_meta;

  function listFiles(subdir){
    let dir= path.join(__dirname, subdir);
    return fs.readdirSync(dir);
  }

  function readFile(f){
    return fs.readFileSync(path.join(__dirname,f), "utf-8");
  }

  let GL='<li><a href="./gallery${n}.html" title="">Gallery ${n}</a></li>';
  let GI=`
  <div class="grid-item">
      <img class="img-responsive" alt="" src="./assets/images/$[id]/$[item]">
      <a href="./assets/images/$[id]/$[item]" class="project-description"
        title="$[title]" class="link-photo project-description"data-lightbox="img">
        <div class="project-text-holder">
          <div class="project-text-inner">
            <h3>$[title]</h3>
            <p>$[artist]</p>
          </div>
        </div>
      </a>
    </div>
    `;

  function delFile(f){
    return delOneFile(path.join(__dirname, f))
  }
  function delOneFile(f){
    try{
      fs.unlinkSync(f)
    }
    catch(e){
    }
  }

  function modGI(id,artist,title,file){
    let s=GI;
    s= s.replaceAll("$[id]", id);
    s= s.replaceAll("$[title]", title);
    s= s.replaceAll("$[item]", file);
    return s.replaceAll("$[artist]", artist);
  }

  function fmtGLinks(pages, out){
    let gs="";
    for(let i=1;i<pages;++i){
      gs += GL.replaceAll("${n}", ""+i) + "\n";
    }
    return out.replace("<!--GALLERY-->",gs);
  }

  function doOthers(pages,root){
    let out= fmtGLinks(pages, root);
    let M=g_meta["rc"];
    let gi="";
    Object.keys(M).forEach(k=>{
      gi += modGI("rc","Gisele",M[k].title,k) + "\n";
    });
    M=g_meta["ec"];
    Object.keys(M).forEach(k=>{
      gi += modGI("ec","Elise",M[k].title,k) + "\n";
    });
    out= out.replace("<!--GALLERYITEMS-->",gi);
    //write file
    let p=path.join(__dirname,"gallery"+(pages-1)+".html");
    delOneFile(p);
    fs.writeFileSync(p,out,"utf-8");
  }

  function doMain(index,pages, root,nums,info){
    let gs="",
        gi="",
        out=fmtGLinks(pages, root);

    for(let s,m,obj,i=0; i<CHUNK;++i){
      if(nums.length>0){
        obj=nums.pop();
        m=g_meta[obj.f];
        gi += modGI(info.id,info.artist,m.title,obj.f) + "\n";
      }
    }
    out= out.replace("<!--GALLERYITEMS-->",gi);
    //write file
    let p=path.join(__dirname,"gallery"+index+".html");
    delOneFile(p);
    fs.writeFileSync(p,out,"utf-8");
    //
    if(index==0){
      delFile("index.html");
      fs.renameSync(p, path.join(__dirname,"index.html"));
    }
  }

  let nums= listFiles(KL).map(x=>{
    let p=x.substring(0,x.lastIndexOf("."));
    let z=/[0-9]+/.test(p);
    return z? {n:parseInt(p),f:x}: null;
  });

  if(nums.some(x=> x===null)){
    return console.log("some file names are not numbered.");
  }

  nums.sort(function(a,b){return a.n<b.n?-11:a.n>b.n?1:0});
  //nums.forEach(c=>console.log(c));
  console.log("number of files= " + nums.length);

  let pages= Math.floor(nums.length/CHUNK);
  if((nums.length%CHUNK)>0) pages+=1;
  pages+=1; // for others
  console.log("pages="+pages);

  let root= readFile(TPL);
  //console.log(root);

  g_meta= JSON.parse(readFile(MNF));
  //console.log(JSON.stringify(meta));

  for(let i=0;i<pages-1;++i){
    doMain(i,pages,root,nums, {id:"kl",artist:"Josen"});
  }

  doOthers(pages,root);

})(this);



