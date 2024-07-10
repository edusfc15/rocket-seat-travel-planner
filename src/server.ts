import fastify from 'fastify';
import { createTrip } from './routes/create-trip';
import { serializerCompiler, validatorCompiler } from 'fastify-type-provider-zod';
import { confirmTrip } from './routes/confirm-trip';
import cors from '@fastify/cors';
import { confirmParticipants } from './routes/confirm-participant';
import { createActivities } from './routes/create-activity';
import { get } from 'http';
import { getActivities } from './routes/get-activities';
import { createLink } from './routes/create-link';
import { getLinks } from './routes/get-links';

const app = fastify();

app.register(cors, {
    origin: 'http://localhost:3333'
});

app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);

app.register(createTrip);
app.register(confirmTrip);
app.register(confirmParticipants);
app.register(createActivities);
app.register(getActivities)
app.register(createLink)
app.register(getLinks)

app.listen({ port: 3333 }).then(() => {
    "Server is running on http://localhost:3333"
});