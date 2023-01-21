function GetRoleName(roleId){
    switch(roleId){
        case 0: return 'No Role';
        case 1: return 'GodFather';
        case 2: return 'Mafia';
        case 3: return 'Citizen';
        case 4: return 'Doctor';
        case 5: return 'Snipper';
        case 6: return 'Inspector';
        case 7: return 'DieHard';
        case 8: return 'Security';
    }

    return 'Unknown';
}