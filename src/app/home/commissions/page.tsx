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
import { useState } from "react";
import { submitCommission } from "@/app/api/commission/submitCommission";
import { useSession } from "next-auth/react";

export interface CommissionFormData {
    garmentType: string;
    measurements: {
      chest: number;
      waist: number;
      hips: number;
      length: number;
      inseam: number;
      shoulders: number;
    };
    budget: string;
    timeline: string;
    details: string;
    user_id: string;

  }

export default function Commissions() {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { 
    register, 
    handleSubmit, 
    formState: { errors }, 
    setValue, 
    watch
  } = useForm<CommissionFormData>({
    defaultValues: {
      measurements: {
        chest: 0,
        shoulders: 0,
        waist: 0,
        hips: 0,
        length: 0,
        inseam: 0,
      }
    }
  });
  const [ garmentType, setGarmentType] = useState("");
  const { data: session, status } = useSession()
  

  const onSubmit = async (data: CommissionFormData) => {
      console.log(data)
      console.log(typeof session?.user)
      if(status === "authenticated"){
        const userObjectId = session?.user?.mongoId
        data.user_id = userObjectId!
        const commish = await submitCommission(JSON.parse(JSON.stringify(data)));
        console.log(commish)
      }
      
    };

  const handleNumberInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Allow only numbers, backspace, delete, tab, arrows, home, end
    const allowedKeys = ['Backspace', 'Delete', 'Tab', 'ArrowLeft', 'ArrowRight', 'Home', 'End', '.'];
    const key = e.key;
    
    // Check if the key is not a number or one of the allowed control keys
    if (!/^[0-9]$/.test(key) && !allowedKeys.includes(key)) {
      e.preventDefault();
    }
  };

  const handleSelectChange = (value: string, field: keyof CommissionFormData) => {
    setValue(field, value, { shouldValidate: true });
    if(field=="garmentType"){
      setValue("measurements.chest", 0)
      setValue("measurements.shoulders", 0)
      setValue("measurements.waist", 0)
      setValue("measurements.hips", 0)
      setValue("measurements.length", 0)
      setValue("measurements.inseam", 0)
      setGarmentType(value);
    }
    
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
              <Select 
                onValueChange={(value) => handleSelectChange(value, "garmentType")}
                defaultValue={watch("garmentType")}
              >
                <SelectTrigger 
                  className={`bg-[#002c22] border-emerald-800/50 focus:ring-emerald-700/30 text-emerald-100 ${errors.garmentType ? "border-red-500" : ""}`}>                  <SelectValue placeholder="Select garment type" />
                </SelectTrigger>
                <SelectContent className="bg-[#002c22] border-emerald-800">
                  <SelectItem value="shirt" className="text-emerald-100">Shirt</SelectItem>
                  <SelectItem value="jacket" className="text-emerald-100">Jacket</SelectItem>
                  <SelectItem value="pants" className="text-emerald-100">Pants</SelectItem>
                  <SelectItem value="other" className="text-emerald-100">Other</SelectItem>
                </SelectContent>
              </Select>
              {errors.garmentType && (
                <p className="text-red-500 text-sm mt-1">Please select a garment type</p>
              )}
              <input 
                type="hidden" 
                {...register("garmentType", { required: "Please select a garment type" })} 
              />
            </div>

            <div>
              <Label className="text-emerald-200">Measurements (inches)</Label>
              <div className="grid grid-cols-2 gap-4">
              <div>
                  <Label htmlFor="chest" className="text-emerald-200/80 text-xs mb-1 block">Chest</Label>
                  <Input
                    id="chest"
                    disabled={garmentType == "pants"}
                    placeholder="Chest"
                    type="number"
                    step="0.1"
                    min="0"
                    {...register("measurements.chest", { required: "Chest measurement is required" })}
                    className={`bg-[#002c22] border-emerald-800/50 focus:ring-emerald-700/30 text-emerald-100 placeholder:text-emerald-500/50 ${errors.measurements?.chest ? "border-red-500" : ""}`}
                    onKeyDown={handleNumberInput}
                  />
                  {errors.measurements?.chest && (
                    <p className="text-red-500 text-sm mt-1">Required</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="shoulders" className="text-emerald-200/80 text-xs mb-1 block">Shoulders</Label>
                  <Input
                    id="shoulders"
                    disabled={garmentType == "pants"}
                    placeholder="Shoulders"
                    type="number"
                    step="0.1"
                    min="0"
                    {...register("measurements.shoulders", { required: "Shoulder measurement is required" })}
                    className={`bg-[#002c22] border-emerald-800/50 focus:ring-emerald-700/30 text-emerald-100 placeholder:text-emerald-500/50 ${errors.measurements?.waist ? "border-red-500" : ""}`}
                    onKeyDown={handleNumberInput}
                  />
                  {errors.measurements?.shoulders && (
                    <p className="text-red-500 text-sm mt-1">Required</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="waist" className="text-emerald-200/80 text-xs mb-1 block">Waist</Label>
                  <Input 
                    id="waist"
                    disabled={garmentType == "shirt" || garmentType == "jacket" }
                    placeholder="Waist" 
                    type="number"
                    step="0.1"
                    min="0"
                    {...register("measurements.waist", { required: "Waist measurement is required" })}
                    className={`bg-[#002c22] border-emerald-800/50 focus:ring-emerald-700/30 text-emerald-100 placeholder:text-emerald-500/50 ${errors.measurements?.hips ? "border-red-500" : ""}`}
                    onKeyDown={handleNumberInput}
                  />
                  {errors.measurements?.waist && (
                    <p className="text-red-500 text-sm mt-1">Required</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="hips" className="text-emerald-200/80 text-xs mb-1 block">Hips</Label>
                  <Input 
                    id="hips"
                    disabled={garmentType == "shirt" || garmentType == "jacket" }
                    placeholder="Hips" 
                    type="number"
                    step="0.1"
                    min="0"
                    {...register("measurements.hips", { required: "Hips measurement is required" })}
                    className={`bg-[#002c22] border-emerald-800/50 focus:ring-emerald-700/30 text-emerald-100 placeholder:text-emerald-500/50 ${errors.measurements?.hips ? "border-red-500" : ""}`}
                    onKeyDown={handleNumberInput}
                  />
                  {errors.measurements?.hips && (
                    <p className="text-red-500 text-sm mt-1">Required</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="length" className="text-emerald-200/80 text-xs mb-1 block">Length</Label>
                  <Input
                    id="length"
                    disabled={garmentType == "shirt" || garmentType == "jacket" }
                    placeholder="Length"
                    type="number"
                    step="0.1"
                    min="0"
                    {...register("measurements.length", { required: "Length measurement is required" })}
                    className={`bg-[#002c22] border-emerald-800/50 focus:ring-emerald-700/30 text-emerald-100 placeholder:text-emerald-500/50 ${errors.measurements?.length ? "border-red-500" : ""}`}
                    onKeyDown={handleNumberInput}
                  />
                  {errors.measurements?.length && (
                    <p className="text-red-500 text-sm mt-1">Required</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="inseam" className="text-emerald-200/80 text-xs mb-1 block">Inseam</Label>
                  <Input
                    id="inseam"
                    disabled={garmentType == "shirt" || garmentType == "jacket" }
                    placeholder="Inseam"
                    type="number"
                    step="0.1"
                    min="0"
                    {...register("measurements.inseam", { required: "Inseam measurement is required" })}
                    className={`bg-[#002c22] border-emerald-800/50 focus:ring-emerald-700/30 text-emerald-100 placeholder:text-emerald-500/50 ${errors.measurements?.length ? "border-red-500" : ""}`}
                    onKeyDown={handleNumberInput}
                  />
                  {errors.measurements?.inseam && (
                    <p className="text-red-500 text-sm mt-1">Required</p>
                  )}
                </div>
              </div>
            </div>

            <div>
              <Label {...register("budget")} htmlFor="budget" className="text-emerald-200">Budget Range</Label>
              <Select 
                onValueChange={(value) => handleSelectChange(value, "budget")}
                defaultValue={watch("budget")}
              >
                <SelectTrigger 
                  className={`bg-[#002c22] border-emerald-800/50 focus:ring-emerald-700/30 text-emerald-100 ${errors.budget ? "border-red-500" : ""}`}>
                  <SelectValue  placeholder="Select budget range" />
                </SelectTrigger>
                <SelectContent {...register("budget")} className="bg-[#002c22] border-emerald-800">
                  <SelectItem {...register("budget")} value="100-300" className="text-emerald-100">$100 - $300</SelectItem>
                  <SelectItem value="300-500" className="text-emerald-100">$300 - $500</SelectItem>
                  <SelectItem value="500-1000" className="text-emerald-100">$500 - $1000</SelectItem>
                  <SelectItem value="1000+" className="text-emerald-100">$1000+</SelectItem>
                </SelectContent>
              </Select>
              {errors.budget && (
                <p className="text-red-500 text-sm mt-1">Please select a budget range</p>
              )}
              <input 
                type="hidden" 
                {...register("budget", { required: "Please select a budget range" })} 
              />
            </div>

            <div>
              <Label htmlFor="timeline" className="text-emerald-200">Timeline</Label>
              <Select 
                onValueChange={(value) => handleSelectChange(value, "timeline")}
                defaultValue={watch("timeline")}
              >
                <SelectTrigger 
                  className={`bg-[#002c22] border-emerald-800/50 focus:ring-emerald-700/30 text-emerald-100 ${errors.timeline ? "border-red-500" : ""}`}>
                  <SelectValue placeholder="Select timeline" />
                </SelectTrigger>
                <SelectContent className="bg-[#002c22] border-emerald-800">
                  <SelectItem value="1-2weeks" className="text-emerald-100">1-2 weeks</SelectItem>
                  <SelectItem value="3-4weeks" className="text-emerald-100">3-4 weeks</SelectItem>
                  <SelectItem value="1-2months" className="text-emerald-100">1-2 months</SelectItem>
                  <SelectItem value="flexible" className="text-emerald-100">Flexible</SelectItem>
                </SelectContent>
              </Select>
              {errors.timeline && (
                <p className="text-red-500 text-sm mt-1">Please select a timeline</p>
              )}
              <input 
                type="hidden" 
                {...register("timeline", { required: "Please select a timeline" })} 
              />
            </div>

            <div>
              <Label htmlFor="details" className="text-emerald-200">Additional Details</Label>
              <Textarea
                id="details"
                {...register("details", { required: "Please provide additional details" })}
                placeholder="Tell us more about your vision..."
                className={`mt-1 h-32 bg-[#002c22] border-emerald-800/50 focus:ring-emerald-700/30 text-emerald-100 placeholder:text-emerald-500/50 ${errors.details ? "border-red-500" : ""}`}
              />
              {errors.details && (
                <p className="text-red-500 text-sm mt-1">Please provide additional details</p>
              )}
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
