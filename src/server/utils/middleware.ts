const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint' })
}

const middleware = {
    unknownEndpoint
}

export default middleware
