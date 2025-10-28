"use client"

import { motion } from "framer-motion"

export function LandingFooter() {
  const footerSections = [
    {
      title: "Product",
      links: [
        { name: "Leaderboard", href: "/leaderboard" },
        { name: "Map", href: "/map" },
        { name: "Dashboard", href: "/dashboard" },
        { name: "Hall of Fame", href: "/hall" }
      ],
    },
    {
      title: "Resources",
      links: [
        { name: "Documentation", href: "#" },
        { name: "Blog", href: "#" },
        { name: "Community", href: "#" },
        { name: "Support", href: "#" }
      ],
    },
    {
      title: "Company",
      links: [
        { name: "About", href: "#" },
        { name: "Careers", href: "#" },
        { name: "Contact", href: "#" },
        { name: "Privacy", href: "#" }
      ],
    },
  ]

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  }

  return (
    <footer className="bg-[#37322F] text-white py-16 px-6">
      <div className="max-w-6xl mx-auto">
        <motion.div
          className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <motion.div variants={itemVariants}>
            <h3 className="font-serif text-2xl mb-4">Rigeo</h3>
            <p className="text-white/70 mb-4">Be Seen. Get Ranked. Share Your Links.</p>
            <div className="flex gap-4">
              <a href="#" className="text-white/70 hover:text-white transition">Twitter</a>
              <a href="#" className="text-white/70 hover:text-white transition">Discord</a>
              <a href="#" className="text-white/70 hover:text-white transition">GitHub</a>
            </div>
          </motion.div>

          {footerSections.map((section, idx) => (
            <motion.div key={idx} variants={itemVariants}>
              <h4 className="font-semibold mb-4">{section.title}</h4>
              <ul className="space-y-2">
                {section.links.map((link, linkIdx) => (
                  <li key={linkIdx}>
                    <a href={link.href} className="text-white/70 hover:text-white transition">
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          className="border-t border-white/20 pt-8 text-center text-white/70"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
        >
          <p>&copy; 2025 Rigeo. All rights reserved.</p>
        </motion.div>
      </div>
    </footer>
  )
}