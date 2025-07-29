import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { ArrowRight, Users, TrendingUp, Zap } from "lucide-react";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-black pt-16 md:pt-20">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-green/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-primary-green/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary-green/5 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      {/* Grid pattern overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(121,231,8,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(121,231,8,0.03)_1px,transparent_1px)] bg-[size:4rem_4rem]"></div>

      <div className="relative z-10 container-custom text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-5xl mx-auto">

          {/* Main Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="text-4xl md:text-6xl lg:text-7xl font-extrabold leading-tight mb-6">
            Skip the Job Boards.
            <br />
            <span className="gradient-text">Get Referrals</span>
            <br />
            That Actually Work.
          </motion.h1>

          {/* Subheading */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
           Join a community that opens real doors at top companies. 
           Connect with professionals, get quality referrals, and land high-impact roles.
          </motion.p>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="flex flex-wrap justify-center gap-8 mb-12">
            <div className="flex items-center gap-2 text-sm md:text-base">
              <Users className="w-5 h-5 text-primary-green" />
              <span className="text-white font-semibold">1,000+</span>
              <span className="text-gray-400">Active Members</span>
            </div>
            <div className="flex items-center gap-2 text-sm md:text-base">
              <TrendingUp className="w-5 h-5 text-primary-green" />
              <span className="text-white font-semibold">85%</span>
              <span className="text-gray-400">Success Rate</span>
            </div>
            <div className="flex items-center gap-2 text-sm md:text-base">
              <Zap className="w-5 h-5 text-primary-green" />
              <span className="text-white font-semibold">100+</span>
              <span className="text-gray-400">Partner Companies</span>
            </div>
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.8 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button
              size="lg"
              onClick={() => window.open('https://community.jobreferral.club', '_blank')} 
              className="btn-primary text-lg px-8 py-4 group transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-primary-green/20">
              Join the Club
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
            </Button>
           
          </motion.div>

          {/* Trust indicators */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.8 }}
            className="mt-16 text-center">
            <p className="text-gray-400 text-sm mb-6">Trusted by professionals at</p>
            <div className="flex flex-wrap justify-center items-center gap-8 opacity-60">
              <div className="text-2xl font-bold transition-all duration-300 hover:opacity-100 hover:text-primary-green cursor-default select-none">Google</div>
              <div className="text-2xl font-bold transition-all duration-300 hover:opacity-100 hover:text-primary-green cursor-default select-none">Meta</div>
              <div className="text-2xl font-bold transition-all duration-300 hover:opacity-100 hover:text-primary-green cursor-default select-none">Apple</div>
              <div className="text-2xl font-bold transition-all duration-300 hover:opacity-100 hover:text-primary-green cursor-default select-none">Microsoft</div>
              <div className="text-2xl font-bold transition-all duration-300 hover:opacity-100 hover:text-primary-green cursor-default select-none">Amazon</div>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.8 }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
        <div className="w-6 h-10 border-2 border-gray-600 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-primary-green rounded-full mt-2 animate-bounce"></div>
        </div>
      </motion.div>
    </section>);

};

export default HeroSection;
