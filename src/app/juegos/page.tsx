'use client'

import GameQuestion from "@/components/juegos/reciclables/GameQuestion";

export default function Juegos() {
    return (
        <div>
            <GameQuestion
                tipo_juego="vocales"
                url_imagen="https://images.pexels.com/photos/145939/pexels-photo-145939.jpeg"
                consigna="¿Con qué vocal empieza el nombre de este animal?"
                respuestas={[
                    {
                        esCorrecta: true,
                        urlImg: "https://images.pexels.com/photos/145939/pexels-photo-145939.jpeg",
                        texto: "A"
                    },
                    {
                        esCorrecta: false,
                        texto: "E"
                    },
                    {
                        esCorrecta: false,
                        urlImg: "https://images.pexels.com/photos/247377/pexels-photo-247377.jpeg",
                        texto: "I"
                    },
                    {
                        esCorrecta: false,
                        urlImg: "https://images.pexels.com/photos/247378/pexels-photo-247378.jpeg",
                        texto: "O"
                    }
                ]}
                onRespuestaSeleccionada={(esCorrecta: boolean) => {
                    console.log(esCorrecta ? "¡Correcto!" : "¡Incorrecto!");
                }}
            />
        </div>
    );
}