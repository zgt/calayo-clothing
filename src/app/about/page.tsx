"use client";

import { motion } from "framer-motion";

export default function About() {
  return (
    <main className="mb-16 min-h-screen px-4 py-4 sm:px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="mx-auto max-w-3xl"
      >
        <div className="rounded-2xl border border-emerald-700/10 bg-gradient-to-br from-emerald-900/20 to-emerald-950/30 p-8 shadow-2xl backdrop-blur-xs">
          <h1 className="mb-6 text-4xl font-bold text-white">About Me</h1>

          <div className="prose prose-emerald prose-invert max-w-none">
            <p className="mb-6 leading-relaxed text-emerald-100/90">
              I&apos;m a software developer with over 4 years of full stack
              experience, specializing in JavaScript and Java applications. My
              technical expertise lies in modern JavaScript frameworks - I built
              this website using React, Next.js, and Supabase, after previously
              creating a version with Solidjs, Solidstart, and MongoDB. I offer
              a strong background in creative problem-solving and a proven
              ability to multi-task and prioritize in fast-paced, stressful
              environments.
            </p>

            <p className="mb-6 leading-relaxed text-emerald-100/90">
              Beyond code, I&apos;m a self-taught fashion designer who turned
              passion into practice. My journey began with a sewing machine and
              countless YouTube tutorials, learning the craft stitch by stitch.
              Currently, I&apos;m exploring Clo-3D to create my own patterns—a
              perfect intersection of my technical skills and creative vision.
            </p>

            <p className="mb-6 leading-relaxed text-emerald-100/90">
              Throughout my life, I&apos;ve explored various creative outlets,
              but nothing resonated until I discovered fashion design. It&apos;s
              become the canvas where my ideas finally take shape, allowing me
              to express myself in ways code alone never could.
            </p>

            <p className="leading-relaxed text-emerald-100/90">
              My dual background gives me a unique perspective—I approach
              fashion with the precision of a developer and bring a
              designer&apos;s creativity to my technical work.
            </p>
          </div>

          <div className="mt-12 border-t border-emerald-700/30 pt-8">
            <h2 className="mb-4 text-2xl font-bold text-white">
              Technical Skills
            </h2>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <h3 className="mb-3 text-lg font-semibold text-emerald-400">
                  Development
                </h3>
                <ul className="space-y-2">
                  <li className="flex items-center text-emerald-100/90">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="mr-2 h-5 w-5 text-emerald-500"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    JavaScript/TypeScript
                  </li>
                  <li className="flex items-center text-emerald-100/90">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="mr-2 h-5 w-5 text-emerald-500"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    React/Next.js
                  </li>
                  <li className="flex items-center text-emerald-100/90">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="mr-2 h-5 w-5 text-emerald-500"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    tRPC
                  </li>
                  <li className="flex items-center text-emerald-100/90">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="mr-2 h-5 w-5 text-emerald-500"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Java
                  </li>
                  <li className="flex items-center text-emerald-100/90">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="mr-2 h-5 w-5 text-emerald-500"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Spring Framework
                  </li>
                  <li className="flex items-center text-emerald-100/90">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="mr-2 h-5 w-5 text-emerald-500"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    SQL
                  </li>
                  <li className="flex items-center text-emerald-100/90">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="mr-2 h-5 w-5 text-emerald-500"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Supabase/MongoDB
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="mb-3 text-lg font-semibold text-emerald-400">
                  Design
                </h3>
                <ul className="space-y-2">
                  <li className="flex items-center text-emerald-100/90">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="mr-2 h-5 w-5 text-emerald-500"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Fashion Design
                  </li>
                  <li className="flex items-center text-emerald-100/90">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="mr-2 h-5 w-5 text-emerald-500"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Pattern Making
                  </li>
                  <li className="flex items-center text-emerald-100/90">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="mr-2 h-5 w-5 text-emerald-500"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Clo-3D
                  </li>
                  <li className="flex items-center text-emerald-100/90">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="mr-2 h-5 w-5 text-emerald-500"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Sewing/Construction
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="mt-12 text-center">
            <a
              href="/commissions"
              className="inline-flex items-center rounded-lg bg-gradient-to-r from-emerald-600 to-emerald-500 px-6 py-3 font-medium text-white shadow-lg shadow-emerald-900/30 transition-all duration-200 hover:from-emerald-500 hover:to-emerald-400 hover:shadow-emerald-800/40"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="mr-2 h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                  clipRule="evenodd"
                />
              </svg>
              Request a Commission
            </a>
          </div>
        </div>
      </motion.div>
    </main>
  );
}
