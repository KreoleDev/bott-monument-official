'use client';
import Image from 'next/image';
import {useEffect,useRef} from 'react';
export function ImageLightbox({images,index,onChange,onClose}:{images:{src:string;title:string;alt:string}[];index:number;onChange:(index:number)=>void;onClose:()=>void}) {
 const dialog=useRef<HTMLDialogElement>(null);
 const item=images[index];
 useEffect(()=>{
  const node=dialog.current!;const overflow=document.body.style.overflow;
  node.showModal();document.body.style.overflow='hidden';
  return()=>{node.close();document.body.style.overflow=overflow;};
 },[]);
 return <dialog ref={dialog} className="image-lightbox" aria-label={item.title} onClose={onClose} onClick={event=>{if(event.target===event.currentTarget) onClose();}} onKeyDown={event=>{
  if(event.key==='ArrowLeft' || event.key==='ArrowRight'){event.preventDefault();onChange((index+(event.key==='ArrowLeft'?-1:1)+images.length)%images.length);}
 }}><div className="image-lightbox-content">
  <button className="lightbox-close" onClick={onClose} aria-label="Close image">×</button>
  <Image src={item.src} alt={item.alt} width={1600} height={1200} sizes="90vw" style={{objectFit:'contain',maxHeight:'75svh',width:'auto',maxWidth:'100%'}}/>
  <p aria-live="polite">{item.title} · {index+1} / {images.length}</p>
  <div className="lightbox-actions"><button onClick={()=>onChange((index-1+images.length)%images.length)}>Previous</button><a href={item.src} target="_blank" rel="noopener noreferrer">Full image</a><button onClick={()=>onChange((index+1)%images.length)}>Next</button></div>
 </div></dialog>;
}
