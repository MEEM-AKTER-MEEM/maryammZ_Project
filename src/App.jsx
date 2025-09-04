// App.jsx — navbar, hero, upload, why, footer (with starfield)
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import "./App.css";
import Starfield from "./Starfield";
import { Upload as UploadIcon, Scan } from "lucide-react";




/* ===== Config ===== */
const MAX_FILES = 10;
const MAX_SIZE_MB = 20;
const ACCEPT_MIME = ["image/png","image/jpeg","image/webp","image/heic","image/heif","application/pdf"];
const ACCEPT_EXT  = [".png",".jpg",".jpeg",".webp",".heic",".heif",".pdf"];
const TOTAL_MAX_BYTES = MAX_FILES * MAX_SIZE_MB * 1024 * 1024;
const bytesToMB = n => (n/(1024*1024)).toFixed(2)+" MB";
const hasExt   = name => ACCEPT_EXT.some(ext => name.toLowerCase().endsWith(ext));
const isAllowed= file => ACCEPT_MIME.includes(file.type) || hasExt(file.name);

/* ===== Navbar ===== */
function Navbar(){
  const [open,setOpen]=useState(false);
  useEffect(()=>{ const onKey=e=>e.key==="Escape"&&setOpen(false); window.addEventListener("keydown",onKey); return()=>window.removeEventListener("keydown",onKey)},[]);
  return(
    <header className="site-header">
      <div className="wrap-wide nav">
        <a className="brand" href="#home"><span className="brand__emojiWrap"><span className="brand__emoji" role="img" aria-label="Logo">📜</span></span><span className="brand__name">Project BanglaOCR</span></a>
        <nav className="nav-links hide-on-mobile">
          <a className="btn btn--outline" href="#home">হোম পেজ</a>
          <a className="btn btn--ghost"   href="#why">কেন দিবেন?</a>
          <a className="btn btn--primary btn--lg" href="#upload">এখনই ডেটা দিন</a>
        </nav>
        <button className={`hamburger show-on-mobile ${open?"is-open":""}`} aria-label="Toggle menu" onClick={()=>setOpen(!open)}><span></span><span></span><span></span></button>
      </div>
      <div className={`mobile-menu ${open?"open":""}`}>
        <div className="wrap-wide mobile-menu__inner">
          <a className="btn btn--outline btn--lg" href="#home" onClick={()=>setOpen(false)}>হোম পেজ</a>
          <a className="btn btn--ghost   btn--lg" href="#why"    onClick={()=>setOpen(false)}>কেন দিবেন?</a>
          <a className="btn btn--primary btn--lg" href="#upload" onClick={()=>setOpen(false)}>এখনই ডেটা দিন</a>
        </div>
      </div>
    </header>
  )
}

/* ===== Hero ===== */
function Hero(){
  return(
    <section id="home" className="hero">
      {/* ✅ 1st container → wrap-wide এর ভেতরে glass */}
      <div className="wrap-wide">
        <div className="glass">
          <div className="hero-grid">
            <div>
              <span className="badge">বাংলা • গবেষণা • সবার জন্য</span>
              <h1 className="headline">আপনার হাতের লেখাই <br/>বাংলা AI-কে এগিয়ে নেবে</h1>
              <p className="sub">
                হাতে লেখা বাংলা সংগ্রহ গবেষণার কাজে। <b>ছবি, PDF, স্ক্যান করা কাগজ</b>—
                যা আছে, সহজে আপলোড করুন। ইচ্ছেমতো বারবার দিতে পারবেন।
              </p>
              <div className="cta">
                <a className="btn btn--primary btn--lg" href="#upload">ডেটা আপলোড শুরু করুন</a>
                <a className="btn btn--secondary btn--lg" href="#why">কেন গুরুত্বপূর্ণ?</a>
              </div>
            </div>
            <div className="feature-grid">
              <article className="card"><h3>গোপনীয়তা</h3><p>তথ্য কেবল গবেষণায় ব্যবহৃত হয়।</p></article>
              <article className="card"><h3>সহজ</h3><p>ড্র্যাগ-এন্ড-ড্রপ / পিকার—যেটা সুবিধা।</p></article>
              <article className="card"><h3>বারবার</h3><p>মন চাইলে বারবার আপলোড।</p></article>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ===== Upload ===== */
function Upload(){
  const [files,setFiles]=useState([]);
  const [errors,setErrors]=useState([]);
  const [showThanks,setShowThanks]=useState(false);
  const inputRef=useRef(null), camRef=useRef(null);

  const acceptStr=useMemo(()=>ACCEPT_MIME.concat(ACCEPT_EXT).join(","),[]);
  const totalBytes=files.reduce((a,b)=>a+(b.file?.size||0),0);
  const meterPct=Math.min(100, Math.round((totalBytes/TOTAL_MAX_BYTES)*100));

  useEffect(()=>()=>files.forEach(i=>i.preview&&URL.revokeObjectURL(i.preview)),[files]);

  const handleFiles=useCallback(list=>{
    const next=[], errs=[];
    Array.from(list).slice(0,MAX_FILES).forEach(f=>{
      if(!isAllowed(f)){ errs.push(`অসমর্থিত ফাইল টাইপ: ${f.name}`); return; }
      if(f.size>MAX_SIZE_MB*1024*1024){ errs.push(`আকার বেশি (${bytesToMB(f.size)}): ${f.name}`); return; }
      const isImg=f.type.startsWith("image/")||(hasExt(f.name)&&!f.type);
      next.push({file:f,kind:isImg?"image":"pdf",preview:isImg?URL.createObjectURL(f):null});
    });
    setErrors(errs); setFiles(next);
  },[]);
  const onChoose=e=>handleFiles(e.target.files);

  const clearAll=()=>{ files.forEach(i=>i.preview&&URL.revokeObjectURL(i.preview)); setFiles([]); setErrors([]); if(inputRef.current) inputRef.current.value=""; if(camRef.current) camRef.current.value=""; };

  const handleSubmit=e=>{ e.preventDefault(); if(!files.length){ setErrors(["কমপক্ষে ১টি ফাইল বাছাই করুন।"]); return; } setShowThanks(true); };

  return(
    <>
      <section id="upload" className="section">
        {/* ✅ 2nd container → same side gap as hero */}
        <div className="wrap-wide">
          <div className="card centered-stack">
            <h2 className="upload-title" >আপনার হাতে লেখা আপলোড করুন</h2>
            <p className="muted">সমর্থিত: JPG/PNG/WEBP/HEIC/HEIF, PDF • একবারে সর্বোচ্চ {MAX_FILES} ফাইল • প্রতিটি সর্বোচ্চ {MAX_SIZE_MB}MB</p>

            <form className="form" onSubmit={handleSubmit}>
              <div className="actions">
               <button type="button" className="btn btn--primary btn--lg" onClick={()=>inputRef.current?.click()}>
  <UploadIcon className="icon-gradient" style={{marginRight:"6px"}} size={20} strokeWidth={2.4}/>
  ছবি / ফাইল আপলোড
</button>

<button type="button" className="btn btn--secondary btn--lg" onClick={()=>camRef.current?.click()}>
  <Scan className="icon-gradient-secondary" style={{marginRight:"6px"}} size={20} strokeWidth={2.4}/>
  মোবাইলে স্ক্যান করুন
</button>
              </div>

              <input ref={inputRef} type="file" accept={acceptStr} multiple hidden onChange={onChoose}/>
              <input ref={camRef}   type="file" accept="image/*" capture="environment" multiple hidden onChange={onChoose}/>

              <div className="meter"><div className="meter__bar" style={{width:`${meterPct}%`}}/></div>
              <div className="meter__text">{files.length} / {MAX_FILES} ফাইল • {bytesToMB(totalBytes)} / {MAX_FILES*MAX_SIZE_MB} MB</div>

              {!!files.length && (
                <>
                  <div className="filelist">
                    {files.map((it,i)=>(
                      <div className="file" key={i}>
                        <div className="file__left">
                          {it.kind==="image"?<img className="file__thumb" src={it.preview} alt=""/>:<span className="file__thumb pdf">PDF</span>}
                          <div className="file__info">
                            <div className="file__name" title={it.file.name}>{it.file.name}</div>
                            <div className="file__meta">{it.kind==="image"?"ছবি":"PDF"} • {bytesToMB(it.file.size)}</div>
                          </div>
                        </div>
                        <button type="button" className="file__remove" onClick={()=>{ const cp=[...files]; const [rm]=cp.splice(i,1); if(rm?.preview) URL.revokeObjectURL(rm.preview); setFiles(cp); }}>মুছুন</button>
                      </div>
                    ))}
                  </div>
                  <div style={{display:"flex",gap:10,flexWrap:"wrap"}}><button type="button" className="btn btn--ghost" onClick={clearAll}>ক্লিয়ার অল</button></div>
                </>
              )}

              {!!errors.length && <div className="errors">{errors.map((e,i)=><div key={i}>• {e}</div>)}</div>}

              <label className="consent"><input type="checkbox" required/> আমি নিশ্চিত করছি যে ফাইলগুলো আমার নিজের/অনুমোদিত এবং গবেষণা-কাজে ব্যবহারে সম্মত।</label>

              <button className="btn btn--primary" type="submit">সাবমিট করুন</button>
            </form>
          </div>
        </div>
      </section>

      {showThanks && <ThanksModal onClose={()=>{ setShowThanks(false); clearAll(); }}/>}
    </>
  )
}

/* ===== Modal & Why & Footer ===== */
function ThanksModal({onClose}){
  useEffect(()=>{ const onKey=e=>e.key==="Escape"&&onClose(); window.addEventListener("keydown",onKey); return()=>window.removeEventListener("keydown",onKey)},[onClose]);
  return(
    <div className="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title" onClick={e=>e.target.classList.contains("modal")&&onClose()}>
      <div className="modal__dialog">
        <h2 id="modal-title" className="modal__title">ধন্যবাদ!</h2>
        <p className="modal__text">আপনার অবদান বাংলা AI-কে আরও এগিয়ে নেবে।</p>
        <div className="modal__actions">
          <button className="btn btn--primary btn--lg" onClick={onClose}>আরও ডেটা দিন</button>
          <a href="#why" className="btn btn--secondary btn--lg" onClick={onClose}>কেন দিচ্ছেন?</a>
        </div>
      </div>
    </div>
  )
}

function Why(){
  return(
    <section id="why" className="section">
      {/* ✅ নিচের 2-column — wrap-wide + ব্ল্যাঙ্ক কলাম auto-hide */}
      <div className="wrap-wide two-col">
        <div className="card">
          <h2>🔎কেন এই ডেটা দরকার?</h2>
          
            <p>বাংলা হাতের লেখা পড়ার মডেল বানাতে বৈচিত্র্যময় ডেটা প্রয়োজন। যত বেশি স্টাইল, অক্ষর, কাগজ ও কালি থাকবে—তত ভালো কাজ করবে।</p>
          
          <p>এগুলো শিক্ষা, নোট ডিজিটাইজেশন, ফর্ম প্রসেসিংসহ নানা ক্ষেত্রে কাজে লাগবে। ডেটা কেবল গবেষণার জন্য ব্যবহার হবে, গোপনীয়তা বজায় রাখা হবে। আপনি চাইলে পরে আরও ফাইল দিতে পারবেন।</p>
        </div>
        <img className="media" src="https://images.unsplash.com/photo-1516542076529-1ea3854896e1?q=80&w=1080&auto=format&fit=crop" alt=""/>
      </div>
    </section>
  )
}

const Footer=()=>(
  <footer className="footer"><div className="wrap-wide">© {new Date().getFullYear()} Project BanglaOCR — বাংলা গবেষণা উদ্যোগ</div></footer>
);

export default function App(){ return(<><Starfield/><Navbar/><Hero/><Upload/><Why/><Footer/></>); }
