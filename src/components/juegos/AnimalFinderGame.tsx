"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, RotateCcw, Trophy, Timer, AlertCircle } from "lucide-react"

interface Animal {
  id: string
  name: string
  x: number // porcentaje de posición X
  y: number // porcentaje de posición Y
  width: number // porcentaje de ancho del área clicable
  height: number // porcentaje de alto del área clicable
  found: boolean
}

export default function AnimalFinderGame() {
  // Actualizado con las posiciones exactas basadas en los nombres en negro
  const [animals, setAnimals] = useState<Animal[]>([
    {
      id: "elefante",
      name: "elefante",
      x: 31,
      y: 5,
      width: 10,
      height: 25,
      found: false,
    },
    {
      id: "cocodrilo",
      name: "cocodrilo",
      x: 30,
      y: 60,
      width: 30,
      height: 14,
      found: false,
    },
    {
      id: "avestruz1",
      name: "avestruz",
      x: 75,
      y: 15,
      width: 5,
      height: 5,
      found: false,
    },
    {
      id: "hipopótamo",
      name: "hipopótamo",
      x: 48,
      y: 55,
      width: 8,
      height: 5,
      found: false,
    },
    {
      id: "avestruz",
      name: "avestruz",
      x: 50,
      y: 10,
      width: 10,
      height: 12,
      found: false,
    },
  ])

  const [gameStarted, setGameStarted] = useState(false)
  const [gameCompleted, setGameCompleted] = useState(false)
  const [gameLost, setGameLost] = useState(false)
  const [timeElapsed, setTimeElapsed] = useState(0)
  const [score, setScore] = useState(0)
  const [showHint, setShowHint] = useState(false)
  const [lastFoundAnimal, setLastFoundAnimal] = useState<string | null>(null)

  const TIME_LIMIT = 120 // 2 minutos en segundos

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (gameStarted && !gameCompleted && !gameLost) {
      interval = setInterval(() => {
        setTimeElapsed((prev) => {
          const newTime = prev + 1
          // Verificar si se acabó el tiempo
          if (newTime >= TIME_LIMIT) {
            setGameLost(true)
            clearInterval(interval)
          }
          return newTime
        })
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [gameStarted, gameCompleted, gameLost])

  useEffect(() => {
    const foundCount = animals.filter((animal) => animal.found).length
    if (foundCount === animals.length && gameStarted) {
      setGameCompleted(true)
      setScore(Math.max(1000 - timeElapsed * 10, 100))
    }
  }, [animals, gameStarted, timeElapsed])

  // Función para manejar clics en toda la imagen
  const handleImageClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!gameStarted || gameCompleted || gameLost) return

    const rect = event.currentTarget.getBoundingClientRect()
    const x = ((event.clientX - rect.left) / rect.width) * 100
    const y = ((event.clientY - rect.top) / rect.height) * 100

    console.log(`Clicked at: ${x.toFixed(1)}%, ${y.toFixed(1)}%`)

    // Encontrar el animal más cercano al clic que no haya sido encontrado
    let closestAnimal = null as Animal | null
    let minDistance = Number.POSITIVE_INFINITY

    animals.forEach((animal) => {
      if (animal.found) return

      // Calcular el centro del animal
      const animalCenterX = animal.x + animal.width / 2
      const animalCenterY = animal.y + animal.height / 2

      // Calcular la distancia al centro del animal
      const distance = Math.sqrt(Math.pow(x - animalCenterX, 2) + Math.pow(y - animalCenterY, 2))

      // Si el clic está dentro del área del animal o muy cerca (tolerancia de 15%)
      if (
        (x >= animal.x - 5 &&
          x <= animal.x + animal.width + 5 &&
          y >= animal.y - 5 &&
          y <= animal.y + animal.height + 5) ||
        distance < 15 // Tolerancia de 15% de la imagen
      ) {
        if (distance < minDistance) {
          minDistance = distance
          closestAnimal = { ...animal }
        }
      }
    })

    // Si encontramos un animal cercano, marcarlo como encontrado
    if (closestAnimal && 'name' in closestAnimal) {
      setLastFoundAnimal(closestAnimal.name)
      setAnimals((prev) =>
        prev.map((animal) => (animal.id === closestAnimal!.id ? { ...animal, found: true } : animal)),
      )

      // Efecto de vibración en móvil
      if (navigator.vibrate) {
        navigator.vibrate(100)
      }
    }
  }

  const resetGame = () => {
    setAnimals((prev) => prev.map((animal) => ({ ...animal, found: false })))
    setGameStarted(false)
    setGameCompleted(false)
    setGameLost(false)
    setTimeElapsed(0)
    setScore(0)
    setShowHint(false)
    setLastFoundAnimal(null)
  }

  const startGame = () => {
    setGameStarted(true)
  }

  const toggleHint = () => {
    setShowHint(!showHint)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const timeRemaining = Math.max(0, TIME_LIMIT - timeElapsed)
  const timePercentage = (timeRemaining / TIME_LIMIT) * 100
  const foundCount = animals.filter((animal) => animal.found).length

  return (
    <div className="p-4">
      <div className="w-full max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-4">
          <h1 className="text-3xl font-bold text-green-800 mb-2">🦁 Safari Animal Finder</h1>
          <div className="flex justify-center gap-4 text-lg mb-2">
            {/* Badge personalizado para tiempo */}
            <div className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-full text-gray-700 shadow-sm">
              <Timer className="w-5 h-5" />
              {formatTime(timeElapsed)} / {formatTime(TIME_LIMIT)}
            </div>
            {/* Badge personalizado para contador */}
            <div className="px-4 py-2 bg-white border border-gray-300 rounded-full text-gray-700 shadow-sm">
              Encontrados: {foundCount}/{animals.length}
            </div>
          </div>

          {/* Barra de progreso personalizada */}
          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${timePercentage < 30 ? "bg-red-500" : timePercentage < 60 ? "bg-yellow-500" : "bg-green-500"
                }`}
              style={{ width: `${timePercentage}%` }}
            ></div>
          </div>
        </div>

        {/* Mensaje de último animal encontrado */}
        {lastFoundAnimal && gameStarted && !gameCompleted && !gameLost && (
          <div className="text-center mb-2 animate-bounce">
            <span className="inline-block px-3 py-1 bg-green-500 text-white rounded-full text-sm font-medium">
              ¡Encontraste: {lastFoundAnimal}!
            </span>
          </div>
        )}

        {/* Game Area */}
        <Card className="relative overflow-hidden mb-4 shadow-2xl">
          <div className="relative cursor-pointer" onClick={handleImageClick}>
            <img
              src="/Jungla.png"
              alt="Safari scene"
              className="w-full h-auto"
              style={{ aspectRatio: "16/10" }}
            />

            {/* Áreas de animales (solo para visualización) */}
            {animals.map((animal) => (
              <div
                key={animal.id}
                className={`absolute pointer-events-none transition-all duration-300 rounded-lg ${showHint ? "bg-yellow-300 bg-opacity-60 border-2 border-yellow-500 animate-pulse" : ""
                  }`}
                style={{
                  left: `${animal.x}%`,
                  top: `${animal.y}%`,
                  width: `${animal.width}%`,
                  height: `${animal.height}%`,
                }}
              >
                {animal.found && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <CheckCircle className="w-8 h-8 text-green-500 bg-white rounded-full animate-bounce shadow-lg" />
                  </div>
                )}
                {showHint && !animal.found && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xs font-bold text-yellow-800 bg-yellow-200 px-1 rounded">{animal.name}</span>
                  </div>
                )}
              </div>
            ))}

            {/* Overlay para juego no iniciado */}
            {!gameStarted && (
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                <div className="text-center text-white">
                  <h2 className="text-xl font-bold mb-4">¡Encuentra todos los animales!</h2>
                  <p className="mb-4">Tienes 2 minutos para encontrarlos todos</p>
                  <Button onClick={startGame} size="lg" className="bg-green-600 hover:bg-green-700">
                    Comenzar Juego
                  </Button>
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Lista de animales a encontrar */}
        <Card className="p-4 mb-4">
          <h3 className="font-semibold mb-3 text-center">Animales por encontrar:</h3>
          <div className="grid grid-cols-3 gap-2">
            {animals.map((animal) => (
              <div
                key={animal.id}
                className={`p-2 rounded-lg text-center text-sm transition-all ${animal.found ? "bg-green-100 text-green-800 line-through" : "bg-gray-100 text-gray-800"
                  }`}
              >
                {animal.found && <CheckCircle className="w-4 h-4 inline mr-1" />}
                {animal.name}
              </div>
            ))}
          </div>
        </Card>

        {/* Controles */}
        <div className="flex gap-2 mb-4">
          <Button
            onClick={resetGame}
            variant="outline"
            className="flex-1"
            disabled={!gameStarted && !gameCompleted && !gameLost}
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Reiniciar
          </Button>
          <Button
            onClick={toggleHint}
            variant="outline"
            className="flex-1"
            disabled={!gameStarted || gameCompleted || gameLost}
          >
            {showHint ? "Ocultar" : "Mostrar"} Pistas
          </Button>
        </div>

        {/* Resultado final - Victoria */}
        {gameCompleted && (
          <Card className="p-6 text-center bg-gradient-to-r from-yellow-100 to-orange-100">
            <Trophy className="w-12 h-12 text-yellow-600 mx-auto mb-3" />
            <h2 className="text-xl font-bold text-yellow-800 mb-2">¡Felicitaciones!</h2>
            <p className="text-yellow-700 mb-3">Encontraste todos los animales en {formatTime(timeElapsed)}</p>
            <div className="text-2xl font-bold text-yellow-800 mb-4">Puntuación: {score}</div>
            <Button onClick={resetGame} className="bg-yellow-600 hover:bg-yellow-700">
              Jugar de Nuevo
            </Button>
          </Card>
        )}

        {/* Resultado final - Derrota por tiempo */}
        {gameLost && (
          <Card className="p-6 text-center bg-gradient-to-r from-red-100 to-pink-100">
            <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-3" />
            <h2 className="text-xl font-bold text-red-800 mb-2">¡Tiempo Agotado!</h2>
            <p className="text-red-700 mb-3">
              Encontraste {foundCount} de {animals.length} animales
            </p>
            <div className="text-lg font-bold text-red-800 mb-4">
              Animales que faltaron:
              <div className="flex flex-wrap gap-2 justify-center mt-2">
                {animals
                  .filter((a) => !a.found)
                  .map((animal) => (
                    <span key={animal.id} className="px-2 py-1 bg-white border border-gray-300 rounded text-sm">
                      {animal.name}
                    </span>
                  ))}
              </div>
            </div>
            <Button onClick={resetGame} className="bg-red-600 hover:bg-red-700">
              Intentar de Nuevo
            </Button>
          </Card>
        )}
      </div>
    </div>
  )
}
