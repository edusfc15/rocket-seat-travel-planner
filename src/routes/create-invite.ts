import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { dayjs } from "../lib/dayjs";
import { getMailClient } from "../lib/mail";
import nodemailer from "nodemailer";
import { env } from "../env";
import { ClientError } from "../errors/client-error";

export async function createInvite(app: FastifyInstance) {
    app.withTypeProvider<ZodTypeProvider>().post('/trips/:tripId/invites', {
        schema: {
            params: z.object({
                tripId: z.string().uuid()
            }),
            body: z.object({
                email: z.string().email()
            })
        },
    }, async (request, reply) => {
        const { tripId } = request.params;
        const { email } = request.body;

        const trip = await prisma.trip.findUnique({
            where: {
                id: tripId
            }
        });

        if (!trip) {
            throw new ClientError('Trip not found');
        }

        const participant = await prisma.participant.create({
            data: {
                email,
                trip_id: tripId
            }
        });

        const formattedStartAt = dayjs(trip.start_at).format('LL');
        const formattedEndAt = dayjs(trip.end_at).format('LL');

        const mail = await getMailClient();

        const confirmationLink = `${env.API_BASE_URL}/participants/${participant.id}/confirm`;
        const message = await mail.sendMail({
            from: {
                name: 'Trip Planner',
                address: 'oi@plann.er'
            }, to: participant.email,
            subject: `Confirme sua presença na viagem para ${trip.destination} em ${formattedStartAt} `,
            html: `
            <div style="font-family: sans-serif;font-size: 16px; line-height: 1.6;">
                <p>
                    Você foi convidado para participar de uma viagem para <strong>${trip.destination}</strong> nas datas de <strong>${formattedStartAt}</strong> até <strong>${formattedEndAt}</strong> .
                </p>
                <p></p>
                <p>
                    Para confirmar sua presença na viagem, clique no link abaixo:
                </p>
                <p></p>
                <p>
                    <a href="${confirmationLink}">Clique aqui para confirmar a viagem</a>
                </p>
                <p></p>
                <p>Caso você não saiba do que se trata esse email, apenas ignore</p>
            </div>
            `
                .trim()
        });

        console.log(nodemailer.getTestMessageUrl(message));

        return { participantId: participant.id}
    })
}