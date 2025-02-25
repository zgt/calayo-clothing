"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";

interface CommissionFormData {
    garmentType: string;
    measurements: {
      chest: string;
      waist: string;
      hips: string;
      length: string;
    };
    budget: string;
    timeline: string;
    details: string;
  }

export default function Commissions() {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { register, handleSubmit, formState: { errors } } = useForm<CommissionFormData>();

    const onSubmit = (data: CommissionFormData) => {
        console.log(data);
        
      };

  return (
    <main className= "-mt-32">
    <div className="max-w-2xl mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[#003a2d] rounded-2xl shadow-lg p-8 border border-emerald-800/30"
      >
        <h2 className="text-3xl font-semibold text-center mb-2 text-emerald-100">
          Clothing Commission Request
        </h2>
        <p className="text-emerald-200/80 text-center mb-8">
          Tell us about your dream garment
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-6">
            <div>
              <Label htmlFor="garmentType" className="text-emerald-200">Garment Type</Label>
              <Select>
                <SelectTrigger className="bg-[#002c22] border-emerald-800/50 focus:ring-emerald-700/30 text-emerald-100">
                  <SelectValue placeholder="Select garment type" />
                </SelectTrigger>
                <SelectContent className="bg-[#002c22] border-emerald-800">
                  <SelectItem value="dress" className="text-emerald-100">Dress</SelectItem>
                  <SelectItem value="shirt" className="text-emerald-100">Shirt</SelectItem>
                  <SelectItem value="pants" className="text-emerald-100">Pants</SelectItem>
                  <SelectItem value="skirt" className="text-emerald-100">Skirt</SelectItem>
                  <SelectItem value="other" className="text-emerald-100">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-emerald-200">Measurements (inches)</Label>
              <div className="grid grid-cols-2 gap-4">
                <Input
                  placeholder="Chest"
                  {...register("measurements.chest")}
                  className="bg-[#002c22] border-emerald-800/50 focus:ring-emerald-700/30 text-emerald-100 placeholder:text-emerald-500/50"
                />
                <Input
                  placeholder="Waist"
                  {...register("measurements.waist")}
                  className="bg-[#002c22] border-emerald-800/50 focus:ring-emerald-700/30 text-emerald-100 placeholder:text-emerald-500/50"
                />
                <Input 
                  placeholder="Hips" 
                  {...register("measurements.hips")}
                  className="bg-[#002c22] border-emerald-800/50 focus:ring-emerald-700/30 text-emerald-100 placeholder:text-emerald-500/50"
                />
                <Input
                  placeholder="Length"
                  {...register("measurements.length")}
                  className="bg-[#002c22] border-emerald-800/50 focus:ring-emerald-700/30 text-emerald-100 placeholder:text-emerald-500/50"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="budget" className="text-emerald-200">Budget Range</Label>
              <Select>
                <SelectTrigger className="bg-[#002c22] border-emerald-800/50 focus:ring-emerald-700/30 text-emerald-100">
                  <SelectValue placeholder="Select budget range" />
                </SelectTrigger>
                <SelectContent className="bg-[#002c22] border-emerald-800">
                  <SelectItem value="100-300" className="text-emerald-100">$100 - $300</SelectItem>
                  <SelectItem value="300-500" className="text-emerald-100">$300 - $500</SelectItem>
                  <SelectItem value="500-1000" className="text-emerald-100">$500 - $1000</SelectItem>
                  <SelectItem value="1000+" className="text-emerald-100">$1000+</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="timeline" className="text-emerald-200">Timeline</Label>
              <Select>
                <SelectTrigger className="bg-[#002c22] border-emerald-800/50 focus:ring-emerald-700/30 text-emerald-100">
                  <SelectValue placeholder="Select timeline" />
                </SelectTrigger>
                <SelectContent className="bg-[#002c22] border-emerald-800">
                  <SelectItem value="1-2weeks" className="text-emerald-100">1-2 weeks</SelectItem>
                  <SelectItem value="3-4weeks" className="text-emerald-100">3-4 weeks</SelectItem>
                  <SelectItem value="1-2months" className="text-emerald-100">1-2 months</SelectItem>
                  <SelectItem value="flexible" className="text-emerald-100">Flexible</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="details" className="text-emerald-200">Additional Details</Label>
              <Textarea
                id="details"
                {...register("details")}
                placeholder="Tell us more about your vision..."
                className="mt-1 h-32 bg-[#002c22] border-emerald-800/50 focus:ring-emerald-700/30 text-emerald-100 placeholder:text-emerald-500/50"
              />
            </div>
          </div>

          <Button type="submit" className="w-full bg-emerald-700 hover:bg-emerald-600 text-emerald-50">
            Submit Commission Request
          </Button>
        </form>
      </motion.div>
    </div>
    </main>
    
  )
}
