"use client"
//import {Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react'
import SignIn from '../../components/sign-in';
import { useSession } from "next-auth/react"
import { useEffect, useState } from "react";
import ProfileButton from '@/components/profileButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import IconButton from '@mui/material/IconButton';
import React from 'react';
import SignOut from '@/components/sign-out';



const userNavigation = [
    { name: 'Your Profile', href: '#', id:"1"},
    { name: 'Your Orders', href: '/home/profile/orders', id:"2"},
    { name: 'Settings', href: '#', id:"3"},
  ];


export default function ProfileDropDown(){
    const { data: session, status } = useSession()
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);
    const handleClick = (event: React.MouseEvent<HTMLElement>) => {
      setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
      setAnchorEl(null);
    };


    useEffect(()=>{

    })
    return(
      status == "authenticated" ? (
        <React.Fragment>
          <IconButton 
              onClick={handleClick}
              aria-controls={open ? 'account-menu' : undefined}
              aria-haspopup="true"
              aria-expanded={open ? 'true' : undefined}
              className="relative flex max-w-xs items-center rounded-full bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800"
            >
            <span className="absolute -inset-1.5" />
            <span className="sr-only">Open user menu</span>
            <img alt="" src={session?.user?.image ?? undefined} className="size-8 rounded-full" />
          </IconButton>
          <Menu 
            anchorEl={anchorEl}
            id="account-menu"
            open={open}
            onClose={handleClose}
            onClick={handleClose}
            className="relative ml-3"
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            
            >
        
              {userNavigation.map((item) => (
                <MenuItem key={item.name}
                    onClick={handleClose}>
                  <ProfileButton
                    profileButtonProps={item}
                  >
                  </ProfileButton>
                </MenuItem>
              ))}

              {status !== "authenticated" ? (
                <React.Fragment/>
              ) : (

                <MenuItem key="signOut">
                  <SignOut/>
                </MenuItem>

              )}
          </Menu>
        </React.Fragment>
        ) : (
          <SignIn/>
        )
        
        
      
    )
};