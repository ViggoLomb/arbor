import demoImage from '../../assets/demo-orthomosaic.jpg'
import type { Project } from '../../types/project'

export default function ProjectPreview({
  variant,
}: {
  variant: Project['preview']
}) {
  if (variant === 'imagery')
    return <img src={demoImage} alt="" className="h-full w-full object-cover" />
  return (
    <svg
      viewBox="0 0 400 240"
      aria-hidden="true"
      className="h-full w-full object-cover"
    >
      <rect width="400" height="240" fill="#e9e9df" />
      <path
        d="M340 0H400V240H310C345 195 322 151 353 109S341 29 340 0Z"
        fill="#bdd8dc"
      />
      <g transform="rotate(-22 200 120)">
        {Array.from({ length: 48 }, (_, i) => (
          <rect
            key={i}
            x={(i % 8) * 54 - 30}
            y={Math.floor(i / 8) * 45 - 20}
            width="44"
            height="34"
            rx="2"
            fill={
              i % 11 === 0 ? '#a9c3a0' : i % 5 === 0 ? '#d8ddd0' : '#d8d9d0'
            }
          />
        ))}
        <path
          d="M-40 130H440M125-60V300"
          fill="none"
          stroke="#f7f7ef"
          strokeWidth="12"
        />
        <rect x="178" y="70" width="98" height="80" rx="3" fill="#b5cba7" />
        {variant === 'coverage' ? (
          <>
            <path
              d="M56 45H280V188H56Z"
              fill="#4c9173"
              fillOpacity=".18"
              stroke="#4d806c"
              strokeWidth="1.5"
              strokeDasharray="5 4"
            />
            {Array.from({ length: 25 }, (_, i) => (
              <circle
                key={i}
                cx={70 + (i % 5) * 42}
                cy={59 + Math.floor(i / 5) * 29}
                r={i % 3 === 0 ? 13 : 7}
                fill="#4f8664"
                fillOpacity=".55"
              />
            ))}
          </>
        ) : (
          <>
            <path
              d="M45 30H301V199H45Z"
              fill="#5b9c80"
              fillOpacity=".06"
              stroke="#698773"
              strokeWidth="1.5"
              strokeDasharray="5 4"
            />
            {Array.from({ length: 35 }, (_, i) => (
              <circle
                key={i}
                cx={55 + (i % 7) * 38}
                cy={40 + Math.floor(i / 7) * 36}
                r="3.4"
                fill={i % 9 === 0 ? '#b77763' : '#4d8871'}
                stroke="#f7f7ef"
                strokeWidth="1"
              />
            ))}
          </>
        )}
      </g>
      <path
        d="M0 217C97 207 152 242 262 218"
        fill="none"
        stroke="#f7f7ef"
        strokeWidth="7"
      />
    </svg>
  )
}
