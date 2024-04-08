import usaddress
import sys

def isPhoneNumber(string):
    return '(' in string and ')' in string

def getAddressComponents(parsedAddress):
    addresses = []
    adressComponents = []
    component_mappings = {
        'AddressNumber': lambda left: adressComponents.append(left),
        'StreetNamePreDirectional': lambda left: adressComponents.append(left),
        'StreetName': lambda left: adressComponents.append(left),
        'StreetNamePostType': lambda left: adressComponents.append(left),
        'OccupancyIdentifier': lambda left: adressComponents.append(left),
        'PlaceName': lambda left: adressComponents.append(left),
        'StateName': lambda left: adressComponents.append(left),
        'ZipCode': lambda left: adressComponents.append(left)
    }
    
    adressStart = False
    for left, right in parsedAddress:
        if right == 'AddressNumber':
            if adressStart:
                if len(adressComponents) > 4: #get rid of random short strings that NLP might find as address
                    addresses.append(' '.join(adressComponents))
                adressComponents = []
            adressStart = True
        if adressStart:
            action = component_mappings.get(right)
            if action:
                action(left)
    
    if len(adressComponents) > 1:
        addresses.append(' '.join(adressComponents))
    
    addresses = [address for address in addresses if not isPhoneNumber(address)]
    
    return addresses

sentInput = input(sys.argv[1])

def getAddressFromTexts(sentInput):
    allAddresses = []
    for text in sentInput:
        parsedAddress = usaddress.parse(text)
        addressList = getAddressComponents(parsedAddress)
        allAddresses.extend(addressList)

    allAddresses = list(set(allAddresses))
    return allAddresses

print(getAddressFromTexts(sentInput))

sys.stdout.flush()