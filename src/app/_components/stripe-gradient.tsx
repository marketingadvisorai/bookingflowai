'use client';

import { useEffect, useRef } from 'react';

const vertexShader = `
  attribute vec2 position;
  void main() {
    gl_Position = vec4(position, 0.0, 1.0);
  }
`;

const fragmentShader = `
  precision highp float;
  uniform float time;
  uniform vec2 resolution;
  
  // BookingFlow brand colors
  vec3 color1 = vec3(1.0, 0.290, 0.0);       // #FF4A00 primary orange
  vec3 color2 = vec3(1.0, 0.420, 0.173);     // #FF6B2C lighter orange
  vec3 color3 = vec3(1.0, 0.690, 0.533);     // #FFB088 peach
  vec3 color4 = vec3(1.0, 0.941, 0.902);     // #FFF0E6 light warm
  vec3 color5 = vec3(0.102, 0.102, 0.102);   // #1A1A1A dark accent
  
  // Smooth noise function for organic movement
  float noise(vec2 p) {
    return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
  }
  
  // Smooth interpolated noise
  float smoothNoise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f); // smoothstep
    
    float a = noise(i);
    float b = noise(i + vec2(1.0, 0.0));
    float c = noise(i + vec2(0.0, 1.0));
    float d = noise(i + vec2(1.0, 1.0));
    
    return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
  }
  
  // Fractal Brownian Motion for organic patterns
  float fbm(vec2 p) {
    float value = 0.0;
    float amplitude = 0.5;
    float frequency = 1.0;
    
    for(int i = 0; i < 5; i++) {
      value += amplitude * smoothNoise(p * frequency);
      frequency *= 2.0;
      amplitude *= 0.5;
    }
    return value;
  }
  
  void main() {
    vec2 uv = gl_FragCoord.xy / resolution.xy;
    
    // Slow, organic movement
    float t = time * 0.08;
    
    // Create flowing gradient with FBM noise
    vec2 p = uv * 3.0 + vec2(t * 0.3, t * 0.2);
    float n1 = fbm(p);
    
    vec2 p2 = uv * 2.5 + vec2(t * -0.2, t * 0.15);
    float n2 = fbm(p2);
    
    vec2 p3 = uv * 4.0 + vec2(t * 0.15, t * -0.25);
    float n3 = fbm(p3);
    
    // Combine noise layers for organic flow
    float pattern = n1 * 0.5 + n2 * 0.3 + n3 * 0.2;
    
    // Create gradient based on position and pattern
    float gradientMix = uv.x * 0.6 + uv.y * 0.4 + pattern * 0.3;
    
    // Blend colors smoothly - warm orange to peach to light warm
    vec3 finalColor;
    if (gradientMix < 0.25) {
      finalColor = mix(color4, color3, gradientMix * 4.0);
    } else if (gradientMix < 0.5) {
      finalColor = mix(color3, color2, (gradientMix - 0.25) * 4.0);
    } else if (gradientMix < 0.75) {
      finalColor = mix(color2, color1, (gradientMix - 0.5) * 4.0);
    } else {
      finalColor = mix(color1, color2, (gradientMix - 0.75) * 4.0);
    }
    
    // Add subtle dark accent in corners for depth
    float vignette = smoothstep(1.2, 0.3, length(uv - 0.5));
    finalColor = mix(color5, finalColor, vignette * 0.95 + 0.05);
    
    // Slight brightness variation for organic feel
    finalColor *= 0.95 + pattern * 0.1;
    
    gl_FragColor = vec4(finalColor, 1.0);
  }
`;

export default function StripeGradient() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number | undefined>(undefined);
  const glRef = useRef<WebGLRenderingContext | null>(null);
  const programRef = useRef<WebGLProgram | null>(null);
  const startTimeRef = useRef<number>(Date.now());

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Try to get WebGL context
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl') as WebGLRenderingContext | null;
    
    if (!gl) {
      console.warn('WebGL not supported, falling back to CSS gradient');
      return;
    }

    glRef.current = gl;

    // Compile shader
    function compileShader(type: number, source: string): WebGLShader | null {
      const shader = gl!.createShader(type);
      if (!shader) return null;
      
      gl!.shaderSource(shader, source);
      gl!.compileShader(shader);
      
      if (!gl!.getShaderParameter(shader, gl!.COMPILE_STATUS)) {
        console.error('Shader compile error:', gl!.getShaderInfoLog(shader));
        gl!.deleteShader(shader);
        return null;
      }
      
      return shader;
    }

    // Create program
    const vShader = compileShader(gl.VERTEX_SHADER, vertexShader);
    const fShader = compileShader(gl.FRAGMENT_SHADER, fragmentShader);
    
    if (!vShader || !fShader) return;

    const program = gl.createProgram();
    if (!program) return;

    gl.attachShader(program, vShader);
    gl.attachShader(program, fShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error('Program link error:', gl.getProgramInfoLog(program));
      return;
    }

    gl.useProgram(program);
    programRef.current = program;

    // Setup vertex buffer (full screen quad)
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
      gl.STATIC_DRAW
    );

    const positionLocation = gl.getAttribLocation(program, 'position');
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

    // Get uniform locations
    const timeLocation = gl.getUniformLocation(program, 'time');
    const resolutionLocation = gl.getUniformLocation(program, 'resolution');

    // Resize handler
    function resize() {
      if (!canvas) return;
      
      const dpr = Math.min(window.devicePixelRatio || 1, 2); // Cap at 2x for performance
      const displayWidth = canvas.clientWidth;
      const displayHeight = canvas.clientHeight;
      
      canvas.width = displayWidth * dpr;
      canvas.height = displayHeight * dpr;
      
      if (gl) {
        gl.viewport(0, 0, canvas.width, canvas.height);
      }
    }

    resize();
    window.addEventListener('resize', resize);

    // Animation loop
    function render() {
      if (!gl || !canvas || !programRef.current) return;

      const currentTime = (Date.now() - startTimeRef.current) / 1000;
      
      gl.uniform1f(timeLocation, currentTime);
      gl.uniform2f(resolutionLocation, canvas.width, canvas.height);
      
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      
      animationFrameRef.current = requestAnimationFrame(render);
    }

    render();

    // Cleanup
    return () => {
      window.removeEventListener('resize', resize);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (gl && programRef.current) {
        gl.deleteProgram(programRef.current);
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      style={{
        // Fallback gradient for browsers without WebGL
        background: 'linear-gradient(135deg, #FFF0E6 0%, #FFB088 25%, #FF6B2C 50%, #FF4A00 75%, #FF6B2C 100%)',
      }}
    />
  );
}
