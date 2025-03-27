"use client"
import { useState } from "react";
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Camera, 
  Ruler,
  Weight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card"
import toast, { Toaster } from 'react-hot-toast';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible"

export default function Profile() {
  const [isEditing, setIsEditing] = useState(false);
  const [isMeasurementsOpen, setIsMeasurementsOpen] = useState(false);
  
  // Mock user data - would normally come from an API or context
  const [userData, setUserData] = useState({
    name: "Jane Smith",
    email: "jane.smith@example.com",
    phone: "(555) 123-4567",
    address: "123 Main Street, Anytown, CA 90210",
    avatarUrl: "",
    measurements: {
      bust: "36",
      waist: "28",
      hip: "38",
      inseam: "30",
      shoulder: "16",
      sleeve: "24",
      height: "5'7\"",
      weight: "135"
    }
  });

  const handleSaveProfile = () => {
    setIsEditing(false);
    toast.success("Your profile has been successfully updated.");
  };

  return (
    <main className= "-mt-32">
    <div className="min-h-screen bg-[#002c22]">
      <div className="container mx-auto pt-8 pb-12 px-4">
        
        <Card className="bg-[#003a2d] border-emerald-800/30 text-emerald-100 max-w-3xl mx-auto">
          <CardHeader className="pb-4">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="relative">
                {/* <Avatar className="h-24 w-24 border-2 border-emerald-600">
                  <AvatarImage src={userData.avatarUrl} alt={userData.name} />
                  <AvatarFallback className="bg-emerald-700 text-emerald-100 text-xl">
                    {userData.name.split(" ").map(n => n[0]).join("")}
                  </AvatarFallback>
                </Avatar> */}
                {isEditing && (
                  <button className="absolute bottom-0 right-0 bg-emerald-600 text-white p-1 rounded-full">
                    <Camera className="h-4 w-4" />
                  </button>
                )}
              </div>
              <div className="flex-1 text-center md:text-left">
                <h2 className="text-2xl font-bold mb-1 text-emerald-100">{userData.name}</h2>
                <p className="text-emerald-200/80">Member since January 2024</p>
              </div>
              <div>
                <Button 
                  onClick={() => isEditing ? handleSaveProfile() : setIsEditing(true)}
                  className="bg-emerald-700 hover:bg-emerald-600 text-emerald-50"
                >
                  {isEditing ? "Save Changes" : "Edit Profile"}
                </Button>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <Label className="text-emerald-200 flex items-center gap-2">
                  <User className="h-4 w-4 text-emerald-500" />
                  Full Name
                </Label>
                {isEditing ? (
                  <Input 
                    value={userData.name}
                    onChange={(e) => setUserData({...userData, name: e.target.value})}
                    className="bg-[#002c22] border-emerald-800/50 text-emerald-100"
                  />
                ) : (
                  <p className="text-emerald-100 pl-6">{userData.name}</p>
                )}
              </div>
              
              <div className="space-y-3">
                <Label className="text-emerald-200 flex items-center gap-2">
                  <Mail className="h-4 w-4 text-emerald-500" />
                  Email Address
                </Label>
                {isEditing ? (
                  <Input 
                    value={userData.email}
                    onChange={(e) => setUserData({...userData, email: e.target.value})}
                    className="bg-[#002c22] border-emerald-800/50 text-emerald-100"
                  />
                ) : (
                  <p className="text-emerald-100 pl-6">{userData.email}</p>
                )}
              </div>
              
              <div className="space-y-3">
                <Label className="text-emerald-200 flex items-center gap-2">
                  <Phone className="h-4 w-4 text-emerald-500" />
                  Phone Number
                </Label>
                {isEditing ? (
                  <Input 
                    value={userData.phone}
                    onChange={(e) => setUserData({...userData, phone: e.target.value})}
                    className="bg-[#002c22] border-emerald-800/50 text-emerald-100"
                  />
                ) : (
                  <p className="text-emerald-100 pl-6">{userData.phone}</p>
                )}
              </div>
              
              <div className="space-y-3">
                <Label className="text-emerald-200 flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-emerald-500" />
                  Address
                </Label>
                {isEditing ? (
                  <Input 
                    value={userData.address}
                    onChange={(e) => setUserData({...userData, address: e.target.value})}
                    className="bg-[#002c22] border-emerald-800/50 text-emerald-100"
                  />
                ) : (
                  <p className="text-emerald-100 pl-6">{userData.address}</p>
                )}
              </div>
            </div>

            {/* My Measurements Section */}
            <div className="pt-4">
              <Collapsible
                open={isMeasurementsOpen}
                onOpenChange={setIsMeasurementsOpen}
                className="border-t border-emerald-800/30 pt-4"
              >
                <CollapsibleTrigger asChild>
                  <Button 
                    variant="ghost" 
                    className="flex w-full justify-between items-center text-lg font-medium text-emerald-100 hover:bg-emerald-800/30"
                  >
                    <div className="flex items-center">
                      <Ruler className="mr-2 h-5 w-5 text-emerald-500" />
                      My Measurements
                    </div>
                    <div className="text-emerald-500">
                      {isMeasurementsOpen ? "−" : "+"}
                    </div>
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="pt-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label className="text-emerald-200 text-sm">Bust</Label>
                      {isEditing ? (
                        <Input 
                          value={userData.measurements.bust}
                          onChange={(e) => setUserData({
                            ...userData, 
                            measurements: {...userData.measurements, bust: e.target.value}
                          })}
                          className="bg-[#002c22] border-emerald-800/50 text-emerald-100"
                          placeholder="Inches"
                        />
                      ) : (
                        <p className="text-emerald-100">{userData.measurements.bust}&quot;</p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-emerald-200 text-sm">Waist</Label>
                      {isEditing ? (
                        <Input 
                          value={userData.measurements.waist}
                          onChange={(e) => setUserData({
                            ...userData, 
                            measurements: {...userData.measurements, waist: e.target.value}
                          })}
                          className="bg-[#002c22] border-emerald-800/50 text-emerald-100"
                          placeholder="Inches"
                        />
                      ) : (
                        <p className="text-emerald-100">{userData.measurements.waist}&quot;</p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-emerald-200 text-sm">Hip</Label>
                      {isEditing ? (
                        <Input 
                          value={userData.measurements.hip}
                          onChange={(e) => setUserData({
                            ...userData, 
                            measurements: {...userData.measurements, hip: e.target.value}
                          })}
                          className="bg-[#002c22] border-emerald-800/50 text-emerald-100"
                          placeholder="Inches"
                        />
                      ) : (
                        <p className="text-emerald-100">{userData.measurements.hip}&quot;</p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-emerald-200 text-sm">Inseam</Label>
                      {isEditing ? (
                        <Input 
                          value={userData.measurements.inseam}
                          onChange={(e) => setUserData({
                            ...userData, 
                            measurements: {...userData.measurements, inseam: e.target.value}
                          })}
                          className="bg-[#002c22] border-emerald-800/50 text-emerald-100"
                          placeholder="Inches"
                        />
                      ) : (
                        <p className="text-emerald-100">{userData.measurements.inseam}&quot;</p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-emerald-200 text-sm">Shoulder</Label>
                      {isEditing ? (
                        <Input 
                          value={userData.measurements.shoulder}
                          onChange={(e) => setUserData({
                            ...userData, 
                            measurements: {...userData.measurements, shoulder: e.target.value}
                          })}
                          className="bg-[#002c22] border-emerald-800/50 text-emerald-100"
                          placeholder="Inches"
                        />
                      ) : (
                        <p className="text-emerald-100">{userData.measurements.shoulder}&quot;</p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-emerald-200 text-sm">Sleeve</Label>
                      {isEditing ? (
                        <Input 
                          value={userData.measurements.sleeve}
                          onChange={(e) => setUserData({
                            ...userData, 
                            measurements: {...userData.measurements, sleeve: e.target.value}
                          })}
                          className="bg-[#002c22] border-emerald-800/50 text-emerald-100"
                          placeholder="Inches"
                        />
                      ) : (
                        <p className="text-emerald-100">{userData.measurements.sleeve}&quot;</p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-emerald-200 text-sm flex items-center gap-1">
                        <Weight className="h-3 w-3 text-emerald-500" />
                        Height
                      </Label>
                      {isEditing ? (
                        <Input 
                          value={userData.measurements.height}
                          onChange={(e) => setUserData({
                            ...userData, 
                            measurements: {...userData.measurements, height: e.target.value}
                          })}
                          className="bg-[#002c22] border-emerald-800/50 text-emerald-100"
                          placeholder="Feet and inches"
                        />
                      ) : (
                        <p className="text-emerald-100">{userData.measurements.height}</p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-emerald-200 text-sm flex items-center gap-1">
                        <Weight className="h-3 w-3 text-emerald-500" />
                        Weight
                      </Label>
                      {isEditing ? (
                        <Input 
                          value={userData.measurements.weight}
                          onChange={(e) => setUserData({
                            ...userData, 
                            measurements: {...userData.measurements, weight: e.target.value}
                          })}
                          className="bg-[#002c22] border-emerald-800/50 text-emerald-100"
                          placeholder="Pounds"
                        />
                      ) : (
                        <p className="text-emerald-100">{userData.measurements.weight} lbs</p>
                      )}
                    </div>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </div>
          </CardContent>
          
          <CardFooter className="border-t border-emerald-800/30 pt-6 justify-between">
            <div className="text-emerald-200/60 text-sm">
              Last updated: April 15, 2024
            </div>
            {isEditing && (
              <Button 
                variant="outline" 
                className="border-emerald-700 text-emerald-300"
                onClick={() => setIsEditing(false)}
              >
                Cancel
              </Button>
            )}
          </CardFooter>
        </Card>
        <Toaster
            position= 'bottom-right'/>
      </div>
    </div>
    </main>
  );
};

