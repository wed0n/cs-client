import { useRef } from 'react'

export default function RefreshButton(props: {
  onClick: React.MouseEventHandler<SVGSVGElement>
}) {
  const svg = useRef<SVGSVGElement | null>(null)
  const degree = useRef(0)
  return (
    <div className="refreshButtonContainer">
      <svg
        ref={svg}
        viewBox="0 0 1024 1024"
        version="1.1"
        xmlns="http://www.w3.org/2000/svg"
        className="refreshButton"
        onClick={(event) => {
          degree.current += 360
          svg.current?.setAttribute(
            'style',
            `transform: rotate(${degree.current}deg);`
          )
          props.onClick(event)
        }}>
        <path
          fill="#f1f1f1"
          d="M960 416V192l-73.056 73.056a447.712 447.712 0 0 0-373.6-201.088C265.92 63.968 65.312 264.544 65.312 512S265.92 960.032 513.344 960.032a448.064 448.064 0 0 0 415.232-279.488 38.368 38.368 0 1 0-71.136-28.896 371.36 371.36 0 0 1-344.096 231.584C308.32 883.232 142.112 717.024 142.112 512S308.32 140.768 513.344 140.768c132.448 0 251.936 70.08 318.016 179.84L736 416h224z"
        />
      </svg>
    </div>
  )
}
