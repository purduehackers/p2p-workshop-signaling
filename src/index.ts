import { Database } from "bun:sqlite";
import { serve } from "bun";
import { eq, lt, inArray, and } from "drizzle-orm";

import { db } from "./db";
import { rooms, offers, answers, candidates } from "./db/schema";

function generateRoomId() {
  return Math.random().toString(36).substring(2, 8);
}

async function cleanupOldRooms() {
  const oneHourAgo = Date.now() - 3600000;
  await db.delete(rooms).where(lt(rooms.createdAt, oneHourAgo));
}

setInterval(cleanupOldRooms, 3600000);

const server = serve({
  port: 3001,
  hostname: "0.0.0.0",
  async fetch(req) {
    const url = new URL(req.url);

    if (req.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        },
      });
    }

    const headers = {
      "Access-Control-Allow-Origin": "*",
      "Content-Type": "application/json",
    };

    try {
      if (url.pathname === "/api/rooms/create" && req.method === "POST") {
        const roomId = generateRoomId();
        await db.insert(rooms).values({
          id: roomId,
          createdAt: Date.now(),
        });
        return new Response(JSON.stringify({ roomId }), { headers });
      } else if (url.pathname === "/api/rooms/check" && req.method === "POST") {
        const { roomId } = await req.json();
        const room = await db
          .select()
          .from(rooms)
          .where(eq(rooms.id, roomId))
          .limit(1);

        return new Response(JSON.stringify({ exists: !!room }), { headers });
      } else if (url.pathname === "/api/offer" && req.method === "POST") {
        const { roomId, offer } = await req.json();
        await db
          .insert(offers)
          .values({
            roomId,
            offer: JSON.stringify(offer),
          })
          .onConflictDoUpdate({
            target: offers.roomId,
            set: { offer: JSON.stringify(offer) },
          });

        return new Response(JSON.stringify({ success: true }), { headers });
      } else if (url.pathname === "/api/offer" && req.method === "GET") {
        const roomId = url.searchParams.get("roomId");
        if (!roomId) {
          return new Response(
            JSON.stringify({ error: "Room ID is required" }),
            { status: 400, headers },
          );
        }

        const offerRow = await db
          .select({ offer: offers.offer })
          .from(offers)
          .where(eq(offers.roomId, roomId))
          .limit(1);

        if (!offerRow[0]?.offer) {
          return new Response(JSON.stringify({ offer: null }), { headers });
        }

        return new Response(
          JSON.stringify({ offer: JSON.parse(offerRow[0].offer) }),
          { headers },
        );
      } else if (url.pathname === "/api/answer" && req.method === "POST") {
        const { roomId, answer } = await req.json();

        await db
          .insert(answers)
          .values({
            roomId,
            answer: JSON.stringify(answer),
          })
          .onConflictDoUpdate({
            target: answers.roomId,
            set: { answer: JSON.stringify(answer) },
          });

        return new Response(JSON.stringify({ success: true }), { headers });
      } else if (url.pathname === "/api/answer" && req.method === "GET") {
        const roomId = url.searchParams.get("roomId");

        if (!roomId) {
          return new Response(
            JSON.stringify({ error: "Room ID is required" }),
            { status: 400, headers },
          );
        }

        const answerRow = await db
          .select({ answer: answers.answer })
          .from(answers)
          .where(eq(answers.roomId, roomId))
          .limit(1);

        if (!answerRow[0]?.answer) {
          return new Response(JSON.stringify({ answer: null }), { headers });
        }

        return new Response(
          JSON.stringify({ answer: JSON.parse(answerRow[0].answer) }),
          { headers },
        );
      } else if (url.pathname === "/api/candidate" && req.method === "POST") {
        const { roomId, candidate, isOfferer } = await req.json();

        await db.insert(candidates).values({
          roomId,
          candidate: JSON.stringify(candidate),
          isOfferer: isOfferer ? 1 : 0,
        });

        return new Response(JSON.stringify({ success: true }), { headers });
      } else if (url.pathname === "/api/candidates" && req.method === "GET") {
        const roomId = url.searchParams.get("roomId");
        const isOfferer = url.searchParams.get("isOfferer") === "1" ? 0 : 1;

        if (!roomId) {
          return new Response(
            JSON.stringify({ error: "Room ID is required" }),
            { status: 400, headers },
          );
        }

        const candidateRows = await db
          .select({
            id: candidates.id,
            candidate: candidates.candidate,
          })
          .from(candidates)
          .where(
            and(
              eq(candidates.roomId, roomId),
              eq(candidates.isOfferer, isOfferer),
            ),
          );

        const candidateIds = candidateRows.map((row) => row.id);

        if (candidateIds.length > 0) {
          await db
            .delete(candidates)
            .where(inArray(candidates.id, candidateIds));
        }

        const candidatesList = candidateRows.map((row) => {
          if (row.candidate === null) {
            return null;
          }

          return JSON.parse(row.candidate);
        });

        return new Response(JSON.stringify({ candidates: candidatesList }), {
          headers,
        });
      }

      return new Response(JSON.stringify({ error: "Not found" }), {
        status: 404,
        headers,
      });
    } catch (error) {
      console.error("Server error:", error);
      return new Response(JSON.stringify({ error: "Server error" }), {
        status: 500,
        headers,
      });
    }
  },
});

console.log(
  `Signaling server running at https://${server.hostname}:${server.port}`,
);
