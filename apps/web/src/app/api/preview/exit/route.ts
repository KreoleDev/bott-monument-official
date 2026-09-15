import {draftMode} from 'next/headers';
import {NextResponse} from 'next/server';
export async function POST(request:Request) {
 const url=new URL(request.url),origin=request.headers.get('origin');
 if(origin && origin!==url.origin) return new Response('Invalid origin',{status:403});
 (await draftMode()).disable();return NextResponse.redirect(new URL('/',url.origin),303);
}
