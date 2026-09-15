import {timingSafeEqual} from 'node:crypto';
export function matchesSecret(actual:string|null,expected:string|undefined) {
 if(!actual || !expected) return false;
 const a=Buffer.from(actual),b=Buffer.from(expected);
 return a.length===b.length && timingSafeEqual(a,b);
}
