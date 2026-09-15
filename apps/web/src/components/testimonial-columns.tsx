'use client';

import { useEffect, useRef, useState } from 'react';
import type { Comment } from '@/lib/comments';

function Column({ comments, index }: { comments: Comment[]; index: number }) {
  const column = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const node = column.current!;
    const track = node.querySelector<HTMLElement>('.test-col-track')!;
    const group = track.firstElementChild as HTMLElement;
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    let height = 0, current = 0, target = 0, last = 0, frame = 0;
    let hovering = false, focused = false, paused = false, drag: number | null = null, startY = 0, startTarget = 0;
    const mod = (n: number) => height ? ((n % height) + height) % height : 0;
    const measure = () => { height = group.getBoundingClientRect().height; current = target = reduced.matches ? 0 : height * (0.14 + index * 0.13); };
    const observer = new ResizeObserver(measure); observer.observe(group); measure();
    const tick = (time: number) => {
      const dt = last ? Math.min(.05, (time-last)/1000) : 0; last = time;
      if (!reduced.matches && !hovering && !focused && !paused && drag === null) target = mod(target + [18,15,12][index] * dt);
      let delta = target - current;
      if (delta > height/2) delta -= height;
      if (delta < -height/2) delta += height;
      current = mod(current + (Math.abs(delta)<.24 ? delta : delta*.16));
      track.style.transform = `translateY(${-current}px)`;
      frame = requestAnimationFrame(tick);
    };
    const enter = () => { hovering = true; }; const leave = () => { hovering = false; };
    const focus = () => { focused = true; }; const blur = () => { focused = false; };
    const down = (event: PointerEvent) => {
      if(event.pointerType !== 'mouse' || event.button !== 0) return;
      drag=event.pointerId; startY=event.clientY; startTarget=target; node.setPointerCapture(event.pointerId);
    };
    const move = (event: PointerEvent) => { if(drag===event.pointerId) target=mod(startTarget-(event.clientY-startY)*1.08); };
    const up = () => { drag=null; };
    const key = (event: KeyboardEvent) => {
      if(event.key==='ArrowDown' || event.key==='ArrowUp') { event.preventDefault(); target=mod(target+(event.key==='ArrowDown'?180:-180)); }
      if(event.code==='Space') { event.preventDefault(); paused=!paused; }
    };
    // Native vertical scrolling on touch keeps every comment reachable without trapping the page.
    let touchY=0;
    const touchStart=(event: TouchEvent)=>{ touchY=event.touches[0].clientY; hovering=true; };
    const touchMove=(event: TouchEvent)=>{ const y=event.touches[0].clientY; target=mod(target+touchY-y); touchY=y; };
    const touchEnd=()=>{ hovering=false; };
    node.addEventListener('mouseenter',enter); node.addEventListener('mouseleave',leave);
    node.addEventListener('focus',focus); node.addEventListener('blur',blur);
    node.addEventListener('pointerdown',down); node.addEventListener('pointermove',move);
    node.addEventListener('pointerup',up); node.addEventListener('pointercancel',up); node.addEventListener('keydown',key);
    node.addEventListener('touchstart',touchStart,{passive:true}); node.addEventListener('touchmove',touchMove,{passive:true}); node.addEventListener('touchend',touchEnd);
    frame=requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(frame); observer.disconnect();
      node.removeEventListener('mouseenter',enter); node.removeEventListener('mouseleave',leave); node.removeEventListener('focus',focus); node.removeEventListener('blur',blur);
      node.removeEventListener('pointerdown',down); node.removeEventListener('pointermove',move); node.removeEventListener('pointerup',up); node.removeEventListener('pointercancel',up); node.removeEventListener('keydown',key);
      node.removeEventListener('touchstart',touchStart); node.removeEventListener('touchmove',touchMove); node.removeEventListener('touchend',touchEnd);
    };
  }, [comments, index]);
  // Repeat short columns enough to fill the viewport; duplicates are presentation only.
  const copies = Math.max(1, Math.ceil(3/comments.length));
  return <div ref={column} className="test-col" tabIndex={0} role="group" aria-label={`Comments column ${index+1}. Arrow keys scroll; Space pauses.`}>
    <div className="test-col-track">{[0,1].map(loop => <div className="test-group" key={loop} aria-hidden={loop===1 || undefined}>
      {Array.from({length:copies}, (_,copy) => comments.map(comment => <article className="test-card" key={`${copy}-${comment.documentId}`} aria-hidden={copy>0 || undefined}>
        <p className="test-quote">{comment.quote}</p>
        <div className="test-person"><span className="test-avatar" aria-hidden="true">✦</span><div><p className="test-name">{comment.personName}</p><p className="test-role">{comment.location}</p></div></div>
      </article>))}
    </div>)}</div>
  </div>;
}

export function TestimonialColumns({ comments }: { comments: Comment[] }) {
  const [count,setCount]=useState(3);
  useEffect(()=>{
    const update=()=>setCount(innerWidth<700?1:innerWidth<=1180?2:3);
    update(); window.addEventListener('resize',update); return()=>window.removeEventListener('resize',update);
  },[]);
  const size=Math.ceil(comments.length/count);
  const columns=Array.from({length:count},(_,i)=>comments.slice(i*size,(i+1)*size)).filter(items=>items.length);
  return <div className="test-columns">{columns.map((items,index)=><Column key={`${count}-${index}`} comments={items} index={index}/>)}</div>;
}
