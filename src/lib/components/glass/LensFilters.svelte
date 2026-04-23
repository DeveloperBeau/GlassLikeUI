<!--
  Mount once at app root. Provides SVG filter defs used by .glass-surface.has-lensing
  for edge refraction on the frosted backdrop layer.
-->
<svg class="glass-lens-defs" aria-hidden="true" focusable="false" width="0" height="0">
	<defs>
		<filter id="glass-lens-refract" x="-10%" y="-10%" width="120%" height="120%">
			<feTurbulence
				type="fractalNoise"
				baseFrequency="0.01 0.01"
				numOctaves="2"
				seed="3"
				result="noise"
			/>
			<feGaussianBlur in="noise" stdDeviation="2" result="softNoise" />
			<feDisplacementMap
				in="SourceGraphic"
				in2="softNoise"
				scale="8"
				xChannelSelector="R"
				yChannelSelector="G"
			/>
		</filter>

		<clipPath id="glass-squircle-path" clipPathUnits="objectBoundingBox">
			<path d="M 0,0.5 C 0,0.08 0.08,0 0.5,0 C 0.92,0 1,0.08 1,0.5 C 1,0.92 0.92,1 0.5,1 C 0.08,1 0,0.92 0,0.5 Z" />
		</clipPath>
	</defs>
</svg>

<style>
	.glass-lens-defs {
		position: absolute;
		width: 0;
		height: 0;
		overflow: hidden;
		pointer-events: none;
	}
</style>
