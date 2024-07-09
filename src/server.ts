import fastify from 'fastify';
import { createTrip } from './routes/create-trip';
import { serializerCompiler, validatorCompiler } from 'fastify-type-provider-zod';
import { confirmTrip } from './routes/confirm-trip';
import cors from '@fastify/cors';

const app = fastify();

app.register(cors, {
    origin: 'http://localhost:3333'
});

app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);

app.register(createTrip);
app.register(confirmTrip);

app.listen({ port: 3333 }).then(() => {
    "Server is running on http://localhost:3333"
});