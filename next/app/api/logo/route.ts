import { NextResponse } from 'next/server';

export async function GET() {
  const imageUrl = 'https://res.cloudinary.com/daqbhghwq/image/upload/v1791192261/deskinculture_logo_cnyrcj.png';
  const res = await fetch(imageUrl);
  const buffer = await res.arrayBuffer();

  return new NextResponse(buffer, {
    headers: {
      'Content-Type': 'image/jpeg',
      'Content-Length': buffer.byteLength.toString(),
      'Cache-Control': 'public, max-age=86400',
    },
    status: 200,
  });
}