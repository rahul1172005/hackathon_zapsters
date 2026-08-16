import { ImageResponse } from 'next/og';

export const alt = 'ZAPSTERS — The Operating System For Hackathons';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          width: '100%',
          height: '100%',
          backgroundColor: '#000000',
          color: '#FFFFFF',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            width: '100%',
            height: '100%',
            padding: '72px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '64px',
                height: '64px',
                borderRadius: '20px',
                backgroundColor: '#800000',
                fontSize: '34px',
                fontWeight: 700,
              }}
            >
              Z
            </div>
            <div style={{ fontSize: '26px', letterSpacing: '6px', color: '#A1A1AA' }}>
              ZAPSTERS
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                fontSize: '76px',
                fontWeight: 300,
                letterSpacing: '-2px',
                lineHeight: '1.05',
              }}
            >
              <span>The Operating System</span>
              <span>For Hackathons</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '28px' }}>
              <div style={{ width: '48px', height: '2px', backgroundColor: '#800000' }} />
              <div style={{ fontSize: '24px', color: '#A1A1AA' }}>
                Run competitions · build teams · judge with precision
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '16px' }}>
            <div
              style={{
                display: 'flex',
                padding: '14px 28px',
                borderRadius: '9999px',
                border: '1px solid #27272A',
                backgroundColor: '#141415',
                fontSize: '16px',
                letterSpacing: '3px',
                color: '#FFFFFF',
              }}
            >
              EXPLORE
            </div>
            <div
              style={{
                display: 'flex',
                padding: '14px 28px',
                borderRadius: '9999px',
                border: '1px solid #27272A',
                backgroundColor: '#141415',
                fontSize: '16px',
                letterSpacing: '3px',
                color: '#FFFFFF',
              }}
            >
              HACKATHONS
            </div>
            <div
              style={{
                display: 'flex',
                padding: '14px 28px',
                borderRadius: '9999px',
                backgroundColor: '#800000',
                fontSize: '16px',
                letterSpacing: '3px',
                color: '#FFFFFF',
              }}
            >
              BUILD WITH US
            </div>
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
