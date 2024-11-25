import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Shield, ChevronRight, Lock, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

const PermissionModal = ({ isOpen, onClose, onSave, permission, positions, menus }) => {
  const [selectedPosition, setSelectedPosition] = useState("");
  const [selectedMenus, setSelectedMenus] = useState([]);
  const [searchMenu, setSearchMenu] = useState("");

  useEffect(() => {
    if (permission) {
      setSelectedPosition(permission.PNUM);
      setSelectedMenus(permission.access.map(menu => menu.MNUM));
    } else {
      setSelectedPosition("");
      setSelectedMenus([]);
    }
    setSearchMenu("");
  }, [permission, isOpen]);

  const handleSave = () => {
    if (!selectedPosition) {
      toast.error("กรุณาเลือกตำแหน่ง");
      return;
    }
    if (selectedMenus.length === 0) {
      toast.error("กรุณาเลือกสิทธิ์การเข้าถึง");
      return;
    }
    onSave({
      position: selectedPosition,
      selectedMenus: selectedMenus
    });
  };

  const filteredMenus = menus.filter(menu => 
    menu.MNAME.toLowerCase().includes(searchMenu.toLowerCase())
  );

  const handleSelectAll = () => {
    if (selectedMenus.length === menus.length) {
      setSelectedMenus([]);
    } else {
      setSelectedMenus(menus.map(menu => menu.MNUMBER));
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden bg-white rounded-xl shadow-2xl border-none">
        <DialogHeader className="px-8 py-6 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border-b">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-white/80 backdrop-blur-sm rounded-xl shadow-inner">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <div>
              <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                {permission ? "แก้ไขสิทธิ์การใช้งาน" : "เพิ่มสิทธิ์การใช้งาน"}
              </DialogTitle>
              <p className="text-sm text-muted-foreground mt-1">
                กำหนดสิทธิ์การเข้าถึงระบบสำหรับตำแหน่งที่เลือก
              </p>
            </div>
          </div>
        </DialogHeader>

        <div className="px-8 py-6 space-y-8">
          <div className="space-y-6">
            <div className="space-y-3">
              <Label htmlFor="position" className="text-base font-semibold text-gray-700 flex items-center gap-2">
                <Lock className="h-4 w-4 text-primary" />
                ตำแหน่ง
              </Label>
              <Select
                onValueChange={setSelectedPosition}
                value={selectedPosition}
                disabled={!!permission}
              >
                <SelectTrigger className="w-full h-12 border-gray-200 rounded-xl focus:ring-primary bg-gray-50/50">
                  <SelectValue placeholder="เลือกตำแหน่ง" />
                </SelectTrigger>
                <SelectContent className="border-none shadow-xl">
                  {positions.map((pos) => (
                    <SelectItem 
                      key={pos.PNUMBER} 
                      value={pos.PNUMBER}
                      className="hover:bg-primary/5 cursor-pointer focus:bg-primary/5"
                    >
                      <div className="flex items-center py-1">
                        <ChevronRight className="h-4 w-4 mr-2 text-primary" />
                        {pos.PNAME}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-base font-semibold text-gray-700 flex items-center gap-2">
                  <Shield className="h-4 w-4 text-primary" />
                  สิทธิ์การเข้าถึง
                </Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleSelectAll}
                  className="text-xs hover:bg-primary/5"
                >
                  {selectedMenus.length === menus.length ? "ยกเลิกทั้งหมด" : "เลือกทั้งหมด"}
                </Button>
              </div>

              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="ค้นหาสิทธิ์การเข้าถึง..."
                  value={searchMenu}
                  onChange={(e) => setSearchMenu(e.target.value)}
                  className="pl-10 h-12 bg-gray-50/50 border-gray-200 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 max-h-[300px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
                {filteredMenus.map((menu) => (
                  <div 
                    key={menu.MNUMBER} 
                    className={`flex items-center space-x-3 p-4 rounded-xl border transition-all duration-200 ${
                      selectedMenus.includes(menu.MNUMBER)
                        ? "border-primary/20 bg-primary/5 shadow-sm"
                        : "border-gray-100 hover:border-primary/20 hover:bg-gray-50"
                    }`}
                  >
                    <Checkbox
                      id={`menu-${menu.MNUMBER}`}
                      checked={selectedMenus.includes(menu.MNUMBER)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedMenus([...selectedMenus, menu.MNUMBER]);
                        } else {
                          setSelectedMenus(selectedMenus.filter(id => id !== menu.MNUMBER));
                        }
                      }}
                      className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                    />
                    <Label 
                      htmlFor={`menu-${menu.MNUMBER}`}
                      className="text-sm cursor-pointer select-none font-medium"
                    >
                      {menu.MNAME}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="px-8 py-6 bg-gray-50/80 border-t backdrop-blur-sm">
          <div className="flex justify-end space-x-3 w-full">
            <Button
              variant="outline"
              onClick={onClose}
              className="hover:bg-white/50 border-gray-200"
            >
              ยกเลิก
            </Button>
            <Button
              onClick={handleSave}
              className="bg-primary hover:bg-primary/90 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
            >
              บันทึก
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PermissionModal;