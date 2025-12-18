/**
 * CAPTCHA simple para prevenir bots en formularios públicos
 * Usa un desafío matemático básico que es fácil para humanos pero difícil para bots
 */

/**
 * Genera un nuevo desafío CAPTCHA
 * @returns {{ question: string, answer: number }}
 */
export const generateCaptcha = () => {
  const num1 = Math.floor(Math.random() * 10) + 1
  const num2 = Math.floor(Math.random() * 10) + 1
  const operations = ['+', '-', '*']
  const operation = operations[Math.floor(Math.random() * operations.length)]
  
  let question = ''
  let answer = 0
  
  switch (operation) {
    case '+':
      question = `${num1} + ${num2}`
      answer = num1 + num2
      break
    case '-':
      // Asegurar que el resultado sea positivo
      const larger = Math.max(num1, num2)
      const smaller = Math.min(num1, num2)
      question = `${larger} - ${smaller}`
      answer = larger - smaller
      break
    case '*':
      // Limitar multiplicación para que sea fácil
      const small1 = Math.floor(Math.random() * 5) + 1
      const small2 = Math.floor(Math.random() * 5) + 1
      question = `${small1} × ${small2}`
      answer = small1 * small2
      break
  }
  
  return { question, answer }
}

/**
 * Valida la respuesta del CAPTCHA
 * @param {number} userAnswer - Respuesta del usuario
 * @param {number} correctAnswer - Respuesta correcta
 * @returns {boolean}
 */
export const validateCaptcha = (userAnswer, correctAnswer) => {
  return parseInt(userAnswer) === correctAnswer
}

