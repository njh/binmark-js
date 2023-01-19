import binmark from 'binmark'

const inputElement = document.getElementById('input')
const outputElement = document.getElementById('output')
const errorElement = document.getElementById('error')

function updateOutput () {
  const input = inputElement.value

  try {
    const result = binmark.parseToHex(input)
    outputElement.innerText = result
    errorElement.innerText = ''
  } catch (error) {
    console.log(error)
    errorElement.innerText = error
  }
}

let debounceTimer = null
inputElement.addEventListener('input', (event) => {
  // Cancels the setTimeout method execution
  if (debounceTimer) {
    clearTimeout(debounceTimer)
  }

  // Executes the func after delay time
  debounceTimer = setTimeout(() => {
    debounceTimer = null
    updateOutput()
  }, 300)
})

updateOutput()

// Set focus on end of text
const end = inputElement.value.length
inputElement.setSelectionRange(end, end)
inputElement.focus()
